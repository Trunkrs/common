import ErrorBase from '../../../models/errors/ErrorBase'

class LambdaInvocationFailedError extends ErrorBase {
  public constructor(error?: any) {
    super()

    this.message = `Lambda Invocation Failed with error: ${JSON.stringify(
      error,
      null,
      2,
    )}`
    Error.captureStackTrace(this)
  }
}

export default LambdaInvocationFailedError
