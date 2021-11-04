import ServiceProvider, { Lifecycle } from '../utils/service-provider'
import { MemoryCache } from '../utils/caching'

import {
  CognitoOAuthClient,
  MachineClient,
  MachineTokenClient,
} from '../services/client'
import SecretsClient from '../services/aws/SecretsClient'

import awsProvider from './aws'
import utilsProvider, { HttpClient } from './utils'
import { JSONSerializer } from '../utils/serialization'

export const coreServicesMachineTokenClient =
  ServiceProvider.createSymbol<MachineTokenClient>(
    'CoreServicesMachineTokenClient',
  )

export const coreServicesMachineClient =
  ServiceProvider.createSymbol<MachineClient>('CoreServicesMachineClient')

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
        utilsProvider.provide(JSONSerializer),
      ),
  )

  coreServicesProvider.register(
    coreServicesMachineClient,
    Lifecycle.Singleton,
    () =>
      new MachineClient(
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
