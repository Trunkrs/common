import { SignatureV4 } from '@aws-sdk/signature-v4'
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers'
import { randomUUID } from 'crypto'
import { Sha256 } from '@aws-crypto/sha256-js'

import ServiceProvider, {
  Lifecycle,
  ServiceSymbol,
} from '../utils/service-provider'
import { HttpClient } from '../services/client'
import AwsV4SignedRequestClient from '../services/client/AwsV4SignedRequestClient'

const configureApiGatewaySignedRequestProvider = (config: {
  baseUrl: string
  stsRoleArn: string
  httpClientSymbol: ServiceSymbol<HttpClient>
  region: string
}): ServiceProvider => {
  const provider = new ServiceProvider()

  provider.register(
    config.httpClientSymbol,
    Lifecycle.Singleton,
    () =>
      new AwsV4SignedRequestClient(
        config.baseUrl,
        new SignatureV4({
          credentials: fromTemporaryCredentials({
            params: {
              RoleArn: config.stsRoleArn,
              RoleSessionName: randomUUID(),
            },
          }),
          service: 'execute-api',
          region: config.region,
          sha256: Sha256,
        }),
      ),
  )

  return provider
}

export default configureApiGatewaySignedRequestProvider
