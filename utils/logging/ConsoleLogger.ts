/* eslint-disable no-console */
import Logger from './Logger'

class ConsoleLogger implements Logger {
  public debug<TMessage>(message: TMessage, ...params: any[]): void {
    console.debug(message, ...params)
  }

  public error<TMessage>(message: TMessage, ...params: any[]): void {
    console.error(message, ...params)
  }

  public info<TMessage>(message: TMessage, ...params: any[]): void {
    console.info(message, ...params)
  }

  public trace<TMessage>(message: TMessage, ...params: any[]): void {
    console.trace(message, ...params)
  }

  public warn<TMessage>(message: TMessage, ...params: any[]): void {
    console.warn(message, ...params)
  }
}

export default ConsoleLogger
