import { FieldCode } from '@lark-opdev/block-basekit-server-api';
import {
  MAX_OUTPUT_IMAGES,
  MAX_OUTPUT_IMAGE_SIZE_BYTES,
  SUPPORTED_INPUT_MIME_TYPES
} from '../constants';
import { fetchRelayImages } from '../data/fetch-relay';
import { downloadAttachmentAsBase64 } from '../data/download-attachment';
import { ensureImageFileName, isSupportedInputMimeType } from '../domain/image-format';
import type { Logger } from '../logger';
import type { AttachmentFieldValue, AttachmentOutput } from '../types';

type ExecuteContext = {
  fetch: (...args: any[]) => Promise<any>;
  logID?: string;
};

type ExecuteParams = {
  prompt?: string;
  referenceImages?: AttachmentFieldValue[];
};

type ExecuteResult = {
  code: FieldCode;
  data?: AttachmentOutput[];
  msg?: string;
};

function previewPrompt(prompt: string) {
  return prompt.slice(0, 100);
}

export async function runVisionDraft(
  params: ExecuteParams,
  context: ExecuteContext,
  logger: Logger
): Promise<ExecuteResult> {
  const prompt = (params.prompt || '').trim();
  const referenceImages = Array.isArray(params.referenceImages)
    ? params.referenceImages
    : [];

  if (!prompt) {
    return {
      code: FieldCode.ConfigError,
      msg: 'prompt is required'
    };
  }

  if (!referenceImages.length) {
    return {
      code: FieldCode.ConfigError,
      msg: 'reference images are required'
    };
  }

  const unsupported = referenceImages.find(
    (attachment) => !isSupportedInputMimeType(attachment.type)
  );
  if (unsupported) {
    return {
      code: FieldCode.InvalidArgument,
      msg: `unsupported mime type: ${unsupported.type}; supported=${SUPPORTED_INPUT_MIME_TYPES.join(',')}`
    };
  }

  const relayReferenceImages = [];
  for (const attachment of referenceImages) {
    relayReferenceImages.push(
      await downloadAttachmentAsBase64(attachment, context, logger)
    );
  }

  logger.info('Calling relay API', {
    promptPreview: previewPrompt(prompt),
    referenceImageCount: relayReferenceImages.length
  });

  const relayResult = await fetchRelayImages(
    {
      prompt,
      referenceImages: relayReferenceImages
    },
    context,
    logger
  );

  if (relayResult.ok === false) {
    const relayCode = relayResult.body?.error?.code;
    const relayMessage = relayResult.body?.error?.message ?? relayResult.rawText;
    if (relayResult.status === 401 || relayResult.status === 403) {
      return {
        code: FieldCode.AuthorizationError,
        msg: relayMessage
      };
    }
    if (relayResult.status === 429 || relayCode === 'RATE_LIMIT') {
      return {
        code: FieldCode.RateLimit,
        msg: relayMessage
      };
    }
    if (relayCode === 'QUOTA_EXHAUSTED') {
      return {
        code: FieldCode.QuotaExhausted,
        msg: relayMessage
      };
    }
    if (relayResult.status >= 400 && relayResult.status < 500) {
      return {
        code: FieldCode.InvalidArgument,
        msg: relayMessage
      };
    }
    return {
      code: FieldCode.Error,
      msg: relayMessage
    };
  }

  const images = relayResult.body.images
    .slice(0, MAX_OUTPUT_IMAGES)
    .filter((image) => image.url);

  if (!images.length) {
    return {
      code: FieldCode.InvalidArgument,
      msg: 'relay returned no images'
    };
  }

  const oversizeImage = images.find(
    (image) =>
      typeof image.sizeBytes === 'number' &&
      image.sizeBytes > MAX_OUTPUT_IMAGE_SIZE_BYTES
  );
  if (oversizeImage) {
    return {
      code: FieldCode.InvalidArgument,
      msg: `relay image too large: ${oversizeImage.name}`
    };
  }

  const attachments: AttachmentOutput[] = images.map((image, index) => ({
    name: ensureImageFileName(image.name || `vision-draft-${index + 1}`, image.mimeType),
    content: image.url,
    contentType: 'attachment/url',
    width: image.width,
    height: image.height
  }));

  return {
    code: FieldCode.Success,
    data: attachments
  };
}
