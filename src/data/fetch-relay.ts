import { RELAY_AUTH_ID, RELAY_API_URL } from '../constants';
import type { Logger } from '../logger';
import type {
  RelayErrorResponse,
  RelayRequest,
  RelayResponse,
  RelaySuccessResponse
} from '../types';

type FetchContext = {
  fetch: (...args: any[]) => Promise<any>;
};

export type RelayHttpResult =
  | {
      ok: true;
      status: number;
      body: RelaySuccessResponse;
    }
  | {
      ok: false;
      status: number;
      body?: RelayErrorResponse;
      rawText: string;
    };

export async function fetchRelayImages(
  request: RelayRequest,
  context: FetchContext,
  logger: Logger
): Promise<RelayHttpResult> {
  const response = await context.fetch(
    RELAY_API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    },
    RELAY_AUTH_ID
  );

  const rawText = await response.text();
  logger.info('Relay response received', {
    status: response.status,
    preview: rawText.slice(0, 500)
  });

  let parsed: RelayResponse | undefined;
  try {
    parsed = rawText ? (JSON.parse(rawText) as RelayResponse) : undefined;
  } catch (error) {
    logger.error('Relay response is not valid JSON', {
      error: String(error)
    });
  }

  if (response.ok && parsed && Array.isArray((parsed as RelaySuccessResponse).images)) {
    return {
      ok: true,
      status: response.status,
      body: parsed as RelaySuccessResponse
    };
  }

  return {
    ok: false,
    status: response.status,
    body: parsed as RelayErrorResponse | undefined,
    rawText
  };
}
