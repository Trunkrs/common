abstract class ErrorBase extends Error {
  protected constructor() {
    super()

    this.name = this.constructor.name
    Error.captureStackTrace(this)
  }
}

export default ErrorBase
