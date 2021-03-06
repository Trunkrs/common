import OAuthClient, {
  ClientCredentialsRequest,
  OAuthResponse, RawOAuthResponse,
} from './OAuthClient'
import { MimeType } from '../../models/enum'

class CognitoOAuthClient extends OAuthClient {
  public async clientCredentialsFlow(
    credentials: ClientCredentialsRequest,
  ): Promise<OAuthResponse> {
    try {
      const data = await this.httpClient.post<RawOAuthResponse>({
        url: `${credentials.domain}/oauth2/token?grant_type=client_credentials`,
        authentication: {
          username: credentials.clientId,
          password: credentials.clientSecret,
        },
        headers: {
          'content-type': MimeType.FormUrlEncoded,
        },
      })

      return OAuthClient.toOAuthResponse(data)
    } catch (error: any) {
      throw OAuthClient.toOAuthError(error)
    }
  }
}

export default CognitoOAuthClient
