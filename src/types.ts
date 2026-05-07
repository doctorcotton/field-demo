export type AttachmentFieldValue = {
  name: string;
  size: number;
  type: string;
  tmp_url: string;
};

export type RelayReferenceImage = {
  name: string;
  mimeType: string;
  dataBase64: string;
};

export type RelayRequest = {
  prompt: string;
  referenceImages: RelayReferenceImage[];
};

export type RelayImage = {
  url: string;
  name: string;
  width?: number;
  height?: number;
  mimeType?: string;
  sizeBytes?: number;
};

export type RelaySuccessResponse = {
  images: RelayImage[];
};

export type RelayErrorCode =
  | 'AUTHORIZATION_ERROR'
  | 'RATE_LIMIT'
  | 'QUOTA_EXHAUSTED'
  | 'INVALID_ARGUMENT'
  | 'CONFIG_ERROR'
  | 'ERROR';

export type RelayErrorResponse = {
  error?: {
    code?: RelayErrorCode;
    message?: string;
  };
};

export type RelayResponse = RelaySuccessResponse | RelayErrorResponse;

export type AttachmentOutput = {
  name: string;
  content: string;
  contentType: 'attachment/url';
  width?: number;
  height?: number;
};
