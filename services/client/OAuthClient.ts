import { OAuthErrorCode } from '../../models/enum'
import { HttpRequestError, OAuthClientError } from '../../models/errors'

import { HttpClient } from './HttpClient'

export enum OAuthGrantType {
  ClientCredentials = 'client_credentials',
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token',
  DeviceCode = 'device_code',
}

export interface OAuthRequest {
  domain: string
  clientId: string
  clientSecret: string
}

/* eslint-disable camelcase */
export interface RawOAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  id_token?: string
  refresh_token?: string
}
/* eslint-enable camelcase */

export interface OAuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  scope: string
  idToken?: string
  refreshToken?: string
}

export interface ClientCredentialsRequest {
  domain: string
  clientId: string
  clientSecret: string
  audience?: string
}

export type AuthorizationCodeRequest = OAuthRequest & {
  code: string
  redirectUri?: string
}
export type RefreshTokenRequest = OAuthRequest & {
  refreshToken: string
}

export interface IOAuthClient {
  clientCredentialsFlow(
    description: ClientCredentialsRequest,
  ): Promise<OAuthResponse>

  exchangeAuthorizationCode(
    description: AuthorizationCodeRequest,
  ): Promise<OAuthResponse>

  refreshToken(description: RefreshTokenRequest): Promise<OAuthResponse>
}

class OAuthClient implements IOAuthClient {
  public constructor(protected readonly httpClient: HttpClient) {}

  public async refreshToken(
    description: RefreshTokenRequest,
  ): Promise<OAuthResponse> {
    try {
      const data = await this.httpClient.post<RawOAuthResponse>({
        url: `${description.domain}/oauth/token`,
        params: {
          grant_type: OAuthGrantType.RefreshToken,
          client_id: description.clientId,
          client_secret: description.clientSecret,
          refresh_token: description.refreshToken,
        },
      })

      return OAuthClient.toOAuthResponse(data)
    } catch (error: any) {
      throw OAuthClient.toOAuthError(error)
    }
  }

  public async exchangeAuthorizationCode(
    description: AuthorizationCodeRequest,
  ): Promise<OAuthResponse> {
    try {
      const data = await this.httpClient.post<RawOAuthResponse>({
        url: `${description.domain}/oauth/token`,
        params: {
          grant_type: OAuthGrantType.AuthorizationCode,
          client_id: description.clientId,
          client_secret: description.clientSecret,
          code: description.code,
          redirect_uri: description.redirectUri,
        },
      })

      return OAuthClient.toOAuthResponse(data)
    } catch (error: any) {
      throw OAuthClient.toOAuthError(error)
    }
  }

  public async clientCredentialsFlow(
    description: ClientCredentialsRequest,
  ): Promise<OAuthResponse> {
    try {
      const data = await this.httpClient.post<RawOAuthResponse>({
        url: `${description.domain}/oauth/token`,
        params: {
          grant_type: OAuthGrantType.ClientCredentials,
          client_id: description.clientId,
          client_secret: description.clientSecret,
          audience: description.audience,
        },
      })

      return OAuthClient.toOAuthResponse(data)
    } catch (error: any) {
      throw OAuthClient.toOAuthError(error)
    }
  }

  protected static toOAuthResponse(raw: RawOAuthResponse): OAuthResponse {
    return {
      accessToken: raw.access_token,
      tokenType: raw.token_type,
      expiresIn: raw.expires_in,
      scope: raw.scope,
      idToken: raw.id_token,
      refreshToken: raw.refresh_token,
    }
  }

  protected static toOAuthError<TErrorCode = OAuthErrorCode>(
    axiosError: HttpRequestError,
  ): OAuthClientError<TErrorCode> {
    return new OAuthClientError<TErrorCode>(
      axiosError.responseData?.data.error as TErrorCode,
      axiosError.responseData?.data.error_description,
    )
  }
}

export default OAuthClient
