const MAX_REFERENCE_IMAGES = 16;
const MAX_OUTPUT_IMAGES = 5;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_INPUT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp'
]);
const SUPPORTED_OUTPUT_FORMATS = new Set(['png', 'jpeg', 'webp']);

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {})
    }
  });
}

function createError(status, code, message, requestId) {
  return json(
    {
      error: {
        code,
        message,
        requestId
      }
    },
    { status }
  );
}

function getRequestId() {
  return crypto.randomUUID();
}

function maskPrompt(prompt) {
  return String(prompt || '').slice(0, 100);
}

function inferExtensionFromMime(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpeg';
  if (mimeType === 'image/webp') return 'webp';
  return 'png';
}

function inferMimeTypeFromFormat(format) {
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'webp') return 'image/webp';
  return 'image/png';
}

function parseSize(size) {
  const matched = String(size || '').match(/^(\d+)x(\d+)$/);
  if (!matched) {
    return {};
  }
  return {
    width: Number(matched[1]),
    height: Number(matched[2])
  };
}

function decodeBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function validateAuth(request, env) {
  const header = request.headers.get('authorization') || '';
  return header === `Bearer ${env.RELAY_ACCESS_TOKEN}`;
}

function validateReferenceImages(referenceImages) {
  if (!Array.isArray(referenceImages) || !referenceImages.length) {
    return 'referenceImages is required';
  }

  if (referenceImages.length > MAX_REFERENCE_IMAGES) {
    return `referenceImages must be <= ${MAX_REFERENCE_IMAGES}`;
  }

  const invalidMime = referenceImages.find(
    (image) => !SUPPORTED_INPUT_TYPES.has(image.mimeType)
  );
  if (invalidMime) {
    return `unsupported mimeType: ${invalidMime.mimeType}`;
  }

  const missingData = referenceImages.find((image) => !image.dataBase64);
  if (missingData) {
    return 'referenceImages[].dataBase64 is required';
  }

  return null;
}

async function callOpenAiEdits(body, env) {
  const formData = new FormData();
  const outputFormat = env.OPENAI_OUTPUT_FORMAT || 'png';
  formData.append('model', env.OPENAI_IMAGE_MODEL || 'gpt-image-1');
  formData.append('prompt', body.prompt);
  formData.append('size', body.size || env.OPENAI_IMAGE_SIZE || '1024x1024');
  formData.append(
    'quality',
    body.quality || env.OPENAI_IMAGE_QUALITY || 'medium'
  );
  formData.append('output_format', outputFormat);
  formData.append(
    'n',
    String(
      Math.max(
        1,
        Math.min(
          MAX_OUTPUT_IMAGES,
          Number(body.count || 1) || 1
        )
      )
    )
  );

  for (const referenceImage of body.referenceImages) {
    const bytes = decodeBase64(referenceImage.dataBase64);
    formData.append(
      'image',
      new File([bytes], referenceImage.name || 'reference-image', {
        type: referenceImage.mimeType
      })
    );
  }

  return {
    outputFormat,
    response: await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      },
      body: formData
    })
  };
}

async function uploadGeneratedImage(params) {
  const {
    bucket,
    requestId,
    index,
    imageBase64,
    mimeType,
    publicBaseUrl
  } = params;

  const extension = inferExtensionFromMime(mimeType);
  if (!SUPPORTED_OUTPUT_FORMATS.has(extension)) {
    throw new Error(`unsupported output format: ${extension}`);
  }

  const bytes = decodeBase64(imageBase64);
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`generated image exceeds ${MAX_IMAGE_BYTES} bytes`);
  }

  const now = new Date();
  const key = [
    'generated',
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    `${requestId}-${index}.${extension}`
  ].join('/');

  await bucket.put(key, bytes, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000, immutable'
    }
  });

  return {
    key,
    url: `${publicBaseUrl.replace(/\/$/, '')}/${key}`,
    sizeBytes: bytes.byteLength
  };
}

function mapOpenAiError(status, body, requestId) {
  const message =
    body?.error?.message || `openai request failed with status ${status}`;

  if (status === 401 || status === 403) {
    return createError(status, 'AUTHORIZATION_ERROR', message, requestId);
  }
  if (status === 429) {
    return createError(status, 'RATE_LIMIT', message, requestId);
  }
  if (status >= 400 && status < 500) {
    return createError(status, 'INVALID_ARGUMENT', message, requestId);
  }
  return createError(502, 'ERROR', message, requestId);
}

export default {
  async fetch(request, env) {
    const requestId = getRequestId();
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/healthz') {
      return json({ ok: true, requestId });
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/images/generate') {
      return createError(404, 'ERROR', 'not found', requestId);
    }

    if (!validateAuth(request, env)) {
      return createError(401, 'AUTHORIZATION_ERROR', 'invalid relay token', requestId);
    }

    const body = await parseJsonBody(request);
    if (!body || typeof body.prompt !== 'string' || !body.prompt.trim()) {
      return createError(400, 'CONFIG_ERROR', 'prompt is required', requestId);
    }

    const referenceValidationError = validateReferenceImages(body.referenceImages);
    if (referenceValidationError) {
      return createError(400, 'INVALID_ARGUMENT', referenceValidationError, requestId);
    }

    console.log(
      JSON.stringify({
        level: 'INFO',
        scope: 'WORKER',
        requestId,
        msg: 'request accepted',
        promptPreview: maskPrompt(body.prompt),
        referenceImageCount: body.referenceImages.length
      })
    );

    const size = body.size || env.OPENAI_IMAGE_SIZE || '1024x1024';
    const { width, height } = parseSize(size);
    const { outputFormat, response: openAiResponse } = await callOpenAiEdits(body, env);
    const openAiText = await openAiResponse.text();

    let openAiBody;
    try {
      openAiBody = openAiText ? JSON.parse(openAiText) : {};
    } catch {
      return createError(502, 'ERROR', 'openai returned invalid json', requestId);
    }

    if (!openAiResponse.ok) {
      return mapOpenAiError(openAiResponse.status, openAiBody, requestId);
    }

    const resultItems = Array.isArray(openAiBody?.data) ? openAiBody.data : [];
    if (!resultItems.length) {
      return createError(502, 'ERROR', 'openai returned no images', requestId);
    }

    const uploadedImages = [];
    for (let i = 0; i < Math.min(resultItems.length, MAX_OUTPUT_IMAGES); i += 1) {
      const item = resultItems[i];
      if (!item?.b64_json) {
        return createError(502, 'ERROR', 'openai image payload missing b64_json', requestId);
      }

      const uploaded = await uploadGeneratedImage({
        bucket: env.VISION_DRAFT_IMAGES,
        requestId,
        index: i + 1,
        imageBase64: item.b64_json,
        mimeType: inferMimeTypeFromFormat(outputFormat),
        publicBaseUrl: env.R2_PUBLIC_BASE_URL
      });

      uploadedImages.push({
        url: uploaded.url,
        name: `${requestId}-${i + 1}.${outputFormat}`,
        mimeType: inferMimeTypeFromFormat(outputFormat),
        sizeBytes: uploaded.sizeBytes,
        width,
        height
      });
    }

    console.log(
      JSON.stringify({
        level: 'INFO',
        scope: 'WORKER',
        requestId,
        msg: 'request completed',
        outputImageCount: uploadedImages.length
      })
    );

    return json({
      images: uploadedImages
    });
  }
};
