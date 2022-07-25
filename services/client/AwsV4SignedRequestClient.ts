import { SignatureV4 } from '@aws-sdk/signature-v4'
import { AxiosRequestConfig } from 'axios'
import { HttpRequest } from '@aws-sdk/protocol-http'
import { URL } from 'url'

import AxiosClient from './AxiosClient'

class AwsV4SignedRequestClient extends AxiosClient {
  private async signRequestInterceptor(
    req: AxiosRequestConfig,
  ): Promise<AxiosRequestConfig> {
    let body: string | undefined
    const hasBody = !!req.data
    if (hasBody) {
      body = JSON.stringify(req.data)
    }

    const method = req.method?.toUpperCase() as string
    const url = new URL(req.url as string)

    const httpRequest = new HttpRequest({
      method,
      hostname: url.hostname,
      path: url.pathname,
      headers: req.headers,
      body,
      query: req.params,
    })

    const signedRequest = await this.signer.sign(httpRequest, {
      signingDate: new Date(),
    })

    req.data = signedRequest.body
    req.headers = signedRequest.headers
    req.params = signedRequest.query

    return req
  }

  public constructor(
    private readonly baseUrl: string,
    private readonly signer: SignatureV4,
  ) {
    super()

    this.axiosClient.interceptors.request.use((req) =>
      this.signRequestInterceptor(req),
    )
  }
}

export default AwsV4SignedRequestClient
