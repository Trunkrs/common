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

const configureCoreServices = (
  baseUrl: string,
  clientSecretName: string
): ServiceProvider => {
  const coreServicesProvider = new ServiceProvider()

  coreServicesProvider.register(
    CognitoOAuthClient,
    Lifecycle.Singleton,
    () => new CognitoOAuthClient(utilsProvider.provide(HttpClient)),
  )

  coreServicesProvider.register(
    MachineTokenClient,
    Lifecycle.Singleton,
    () =>
      new MachineTokenClient(
        clientSecretName,
        awsProvider.provide(SecretsClient),
        coreServicesProvider.provide(CognitoOAuthClient),
      ),
  )

  coreServicesProvider.register(
    MachineClient,
    Lifecycle.Singleton,
    () =>
      new MachineClient(
        coreServicesProvider.provide(MachineTokenClient),
        utilsProvider.provide(HttpClient),
        utilsProvider.provide(MemoryCache),
        'core-services-token',
        baseUrl,
      ),
  )

  return coreServicesProvider
}

export default configureCoreServices
