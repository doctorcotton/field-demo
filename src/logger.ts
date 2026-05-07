type LoggerContext = {
  logID?: string;
};

export type Logger = {
  debug(msg: string, data?: Record<string, unknown>): void;
  info(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
};

function writeLog(
  level: string,
  scope: string,
  context: LoggerContext | undefined,
  msg: string,
  data?: Record<string, unknown>
) {
  const payload: Record<string, unknown> = {
    level,
    scope,
    msg,
    logID: context?.logID || `${scope}_${Date.now()}`
  };

  if (data) {
    Object.assign(payload, data);
  }

  console.log(JSON.stringify(payload));
}

export function getLogger(scope: string, context?: LoggerContext): Logger {
  return {
    debug: (msg, data) => writeLog('DEBUG', scope, context, msg, data),
    info: (msg, data) => writeLog('INFO', scope, context, msg, data),
    warn: (msg, data) => writeLog('WARN', scope, context, msg, data),
    error: (msg, data) => writeLog('ERROR', scope, context, msg, data)
  };
}
