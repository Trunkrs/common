import ServiceProvider, { Lifecycle } from '../utils/service-provider'

import {
  MachineClient,
  MachineTokenClient,
  OAuthClient,
} from '../services/client'
import utilsProvider, { HttpClient, Logger, Serializer } from './utils'

import { configureDailyTokenCache, DailyTokenCache } from './caching'
import awsProvider from './aws'
import { SecretsClient } from '../services/aws'

export const Auth0MachineClient =
  ServiceProvider.createSymbol<MachineClient>('Auth0MachineClient')

export const Auth0MachineTokenClient =
  ServiceProvider.createSymbol<MachineTokenClient>('Auth0MachineTokenClient')

/**
 * Configures the necessary services for use with an Auth0 secured machine service.
 * @param baseUrl The base url of the service.
 * @param appClientSecretName The name of the app client secret.
 * @param tokenCacheStoreName The name of the token cache secret store.
 * @param tokenCacheMountPath The mount path of the EFS file system, used for locking.
 */
export const configureAuth0Service = (
  baseUrl: string,
  appClientSecretName: string,
  tokenCacheStoreName: string,
  tokenCacheMountPath: string,
): ServiceProvider => {
  const serviceProvider = new ServiceProvider(
    configureDailyTokenCache(tokenCacheStoreName, tokenCacheMountPath),
  )

  serviceProvider.register(
    Auth0MachineTokenClient,
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
    Auth0MachineClient,
    Lifecycle.Singleton,
    () =>
      new MachineClient(
        serviceProvider.provide(Auth0MachineTokenClient),
        utilsProvider.provide(HttpClient),
        serviceProvider.provide(DailyTokenCache),
        appClientSecretName,
        baseUrl,
      ),
  )

  return serviceProvider
}
