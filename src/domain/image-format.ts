const MIME_TO_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
};

export function isSupportedInputMimeType(mimeType: string) {
  return Boolean(MIME_TO_EXTENSION[mimeType]);
}

export function inferImageExtension(name: string, mimeType?: string) {
  const normalizedName = (name || '').toLowerCase();
  if (normalizedName.endsWith('.png')) return 'png';
  if (normalizedName.endsWith('.jpg') || normalizedName.endsWith('.jpeg')) {
    return 'jpg';
  }
  if (normalizedName.endsWith('.webp')) return 'webp';
  if (mimeType && MIME_TO_EXTENSION[mimeType]) return MIME_TO_EXTENSION[mimeType];
  return 'png';
}

export function ensureImageFileName(name: string, mimeType?: string) {
  const baseName = (name || '').trim() || 'vision-draft-image';
  if (/\.[a-zA-Z0-9]+$/.test(baseName)) {
    return baseName;
  }
  return `${baseName}.${inferImageExtension(baseName, mimeType)}`;
}
