import ErrorBase from './ErrorBase'

class OperationNotSupportedError extends ErrorBase {
  public constructor(message: string) {
    super()

    this.name = 'OperationNotSupportedError'
    this.message = message

    Error.captureStackTrace(this)
  }
}

export default OperationNotSupportedError
