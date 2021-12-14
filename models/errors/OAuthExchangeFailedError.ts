import ErrorBase from './ErrorBase'

class OAuthExchangeFailedError extends ErrorBase {
  public constructor(
    public readonly error: Error,
  ) {
    super()

    this.message = `The OAuth request failed to reach the server with error: ${JSON.stringify(error, null, 2)}`
  }
}

export default OAuthExchangeFailedError
