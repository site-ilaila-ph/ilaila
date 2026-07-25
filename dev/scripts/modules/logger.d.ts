interface LoggingFn {
  (message: string): void;
}

interface LoggingAction {
  (): void;
}

interface LogBlock<TReturn> {
  (): TReturn;
}

interface LoggingBlockFn {
  <TReturn>(fn: LogBlock<TReturn>): TReturn;
}

interface Logger {
  log: LoggingFn;
  warn: LoggingFn;
  error: LoggingFn;
  indent: LoggingAction;
  dedent: LoggingAction;
  asIs: {
    log: LoggingFn;
    warn: LoggingFn;
    error: LoggingFn;
  };
  block: LoggingBlockFn;
}

interface LoggerOptions {
  indent: number;
}

declare function loggerFrom(options: LoggerOptions): Logger;
export { loggerFrom };
