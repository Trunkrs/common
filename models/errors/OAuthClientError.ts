import ErrorBase from './ErrorBase'
import { OAuthErrorCode } from '../enum'

class OAuthClientError<TErrorCode = OAuthErrorCode> extends ErrorBase {
  public constructor(
    public readonly code: TErrorCode,
    public readonly description: string,
  ) {
    super()

    this.message = `The OAuth request failed with code: ${code}`
  }
}

export default OAuthClientError
