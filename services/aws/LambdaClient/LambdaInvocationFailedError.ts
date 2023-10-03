import ErrorBase from '../../../models/errors/ErrorBase'

class LambdaInvocationFailedError extends ErrorBase {
  public constructor(logs: string, error?: any) {
    super()

    this.message = `Lambda Invocation Failed with error: ${JSON.stringify(
      error,
      null,
      2,
    )}. Last 4KB of executed lambda logs: ${logs}
    `

    Error.captureStackTrace(this)
  }
}

export default LambdaInvocationFailedError
