import ServiceProvider, { Lifecycle } from '../utils/service-provider'

import {
  InternalAPIMachineClient,
  MachineClient,
  MachineTokenClient,
  OAuthClient,
} from '../services/client'
import utilsProvider, { HttpClient, Logger, Serializer } from './utils'

import { configureDailyTokenCache, DailyTokenCache } from './caching'
import awsProvider from './aws'
import { SecretsClient } from '../services/aws'
import { InternalAPIQueryStringSerializer } from '../utils/serialization'

export const InternalAuth0MachineClient =
  ServiceProvider.createSymbol<MachineClient>('InternalAuth0MachineClient')

export const InternalAuth0MachineTokenClient =
  ServiceProvider.createSymbol<MachineTokenClient>('InternalAuth0MachineTokenClient')

/**
 * Configures the necessary services for use with an Auth0 secured machine service for internal APIs which
 * follow a specific query parameter format.
 * @param baseUrl The base url of the service.
 * @param appClientSecretName The name of the app client secret.
 * @param tokenCacheStoreName The name of the token cache secret store.
 * @param tokenCacheMountPath The mount path of the EFS file system, used for locking.
 */
export const configureInternalAuth0Service = (
  baseUrl: string,
  appClientSecretName: string,
  tokenCacheStoreName: string,
  tokenCacheMountPath: string,
): ServiceProvider => {
  const serviceProvider = new ServiceProvider(
    configureDailyTokenCache(tokenCacheStoreName, tokenCacheMountPath),
  )

  serviceProvider.register(
    InternalAuth0MachineTokenClient,
    Lifecycle.Singleton,
    () =>
      new MachineTokenClient(
        appClientSecretName,
        awsProvider.provide(SecretsClient),
        utilsProvider.provide(OAuthClient),
        utilsProvider.provide(Serializer),
      ),
  )

  utilsProvider.provide(Logger)



  serviceProvider.register(
    InternalAuth0MachineClient,
    Lifecycle.Singleton,
    () =>
      new InternalAPIMachineClient(
        serviceProvider.provide(InternalAuth0MachineTokenClient),
        utilsProvider.provide(HttpClient),
        serviceProvider.provide(DailyTokenCache),
        appClientSecretName,
        baseUrl,
        utilsProvider.provide(InternalAPIQueryStringSerializer),
      ),
  )

  return serviceProvider
}
