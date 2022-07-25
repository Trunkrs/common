import { aws4Interceptor } from 'aws4-axios'
import { AxiosRequestConfig } from 'axios'

import AxiosClient from './AxiosClient'

class AwsV4SignedRequestClient extends AxiosClient {
  private signRequestInterceptor = (
    requestConfig: AxiosRequestConfig,
  ): Promise<AxiosRequestConfig> => {
    return this.interceptor(requestConfig)
  }

  public constructor(
    private readonly interceptor: ReturnType<typeof aws4Interceptor>,
  ) {
    super()

    this.axiosClient.interceptors.request.use(this.signRequestInterceptor)
  }
}

export default AwsV4SignedRequestClient
