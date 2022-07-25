import { aws4Interceptor, InterceptorOptions } from 'aws4-axios'

import ServiceProvider, {
  Lifecycle,
  ServiceSymbol,
} from '../utils/service-provider'
import { HttpClient } from '../services/client'
import AwsV4SignedRequestClient from '../services/client/AwsV4SignedRequestClient'

const configureApiGatewaySignedRequestProvider = (config: {
  httpClientSymbol: ServiceSymbol<HttpClient>
  interceptorOptions: InterceptorOptions
}): ServiceProvider => {
  const provider = new ServiceProvider()

  provider.register(
    config.httpClientSymbol,
    Lifecycle.Singleton,
    () =>
      new AwsV4SignedRequestClient(aws4Interceptor(config.interceptorOptions)),
  )

  return provider
}

export default configureApiGatewaySignedRequestProvider
