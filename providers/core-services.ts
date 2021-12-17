import ServiceProvider, { Lifecycle } from '../utils/service-provider'

import {
  CognitoOAuthClient,
  CoreServicesMachineClient,
  MachineTokenClient,
} from '../services/client'
import SecretsClient from '../services/aws/SecretsClient'

import awsProvider from './aws'
import utilsProvider, { Serializer, HttpClient, MemoryCache } from './utils'

export const coreServicesMachineTokenClient =
  ServiceProvider.createSymbol<MachineTokenClient>(
    'CoreServicesMachineTokenClient',
  )

export const coreServicesMachineClient =
  ServiceProvider.createSymbol<CoreServicesMachineClient>(
    'CoreServicesMachineClient',
  )

/**
 * Configures the machine client and dependencies for interaction with core services.
 * @param baseUrl The base url of the services.
 * @param clientSecretName The app client secret name.
 */
const configureCoreServices = (
  baseUrl: string,
  clientSecretName: string,
): ServiceProvider => {
  const coreServicesProvider = new ServiceProvider()

  coreServicesProvider.register(
    CognitoOAuthClient,
    Lifecycle.Singleton,
    () => new CognitoOAuthClient(utilsProvider.provide(HttpClient)),
  )

  coreServicesProvider.register(
    coreServicesMachineTokenClient,
    Lifecycle.Singleton,
    () =>
      new MachineTokenClient(
        clientSecretName,
        awsProvider.provide(SecretsClient),
        coreServicesProvider.provide(CognitoOAuthClient),
        utilsProvider.provide(Serializer),
      ),
  )

  coreServicesProvider.register(
    coreServicesMachineClient,
    Lifecycle.Singleton,
    () =>
      new CoreServicesMachineClient(
        coreServicesProvider.provide(coreServicesMachineTokenClient),
        utilsProvider.provide(HttpClient),
        utilsProvider.provide(MemoryCache),
        'core-services-token',
        baseUrl,
      ),
  )

  return coreServicesProvider
}

export default configureCoreServices
