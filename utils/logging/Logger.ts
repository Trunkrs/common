interface Logger {
  /**
   * Logs an informational message to the logging system.
   * @param message The message to log.
   * @param params Any optional parameters to log.
   */
  info<TMessage>(message: TMessage, ...params: any[]): void

  /**
   * Logs an error message to the logging system.
   * @param message The message to log.
   * @param params Any optional params to log.
   */
  error<TMessage>(message: TMessage, ...params: any[]): void

  /**
   * Logs a trace message to the logging system.
   * @param message The message to log.
   * @param params Any optional parameters to log.
   */
  trace<TMessage>(message: TMessage, ...params: any[]): void

  /**
   * Logs a debug message to the logging system.
   * @param message The message to log.
   * @param params Any optional parameters to log.
   */
  debug<TMessage>(message: TMessage, ...params: any[]): void

  /**
   * Logs a warning message to the logging system.
   * @param message The message to log.
   * @param params Any optional parameters to log.
   */
  warn<TMessage>(message: TMessage, ...params: any[]): void
}

export default Logger
