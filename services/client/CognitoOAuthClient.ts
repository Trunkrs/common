import OAuthClient, {
  ClientCredentialsRequest,
  OAuthResponse,
} from './OAuthClient'
import { MimeType } from '../../models/enum'

class CognitoOAuthClient extends OAuthClient {
  public async clientCredentialsFlow(
    credentials: ClientCredentialsRequest,
  ): Promise<OAuthResponse> {
    try {
      const { data } = await this.httpClient.post({
        url: `${credentials.domain}/oauth2/token?grant_type/client_credentials`,
        authentication: {
          username: credentials.clientId,
          password: credentials.clientSecret,
        },
        headers: {
          'Content-Type': MimeType.FormUrlEncoded,
        },
        params: {},
      })

      return OAuthClient.toOAuthResponse(data)
    } catch (error: any) {
      throw OAuthClient.toOAuthError(error)
    }
  }
}

export default CognitoOAuthClient
