declare const Buffer: any;

import type { Logger } from '../logger';
import type { AttachmentFieldValue, RelayReferenceImage } from '../types';

type FetchContext = {
  fetch: (...args: any[]) => Promise<any>;
};

export async function downloadAttachmentAsBase64(
  attachment: AttachmentFieldValue,
  context: FetchContext,
  logger: Logger
): Promise<RelayReferenceImage> {
  logger.info('Downloading reference image', {
    name: attachment.name,
    mimeType: attachment.type,
    size: attachment.size
  });

  const response = await context.fetch(attachment.tmp_url);
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    name: attachment.name,
    mimeType: attachment.type,
    dataBase64: buffer.toString('base64')
  };
}
