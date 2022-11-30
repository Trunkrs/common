import ErrorBase from '../../../models/errors/ErrorBase'

class LambdaInvocationFailedError extends ErrorBase {
  public constructor(error?: any) {
    super()

    this.message =
      'exact token exchange failed for the second time. No other lambda function set the token'
    Error.captureStackTrace(this)
  }
}

export default LambdaInvocationFailedError
