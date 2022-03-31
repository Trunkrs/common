import ServiceProvider, { Lifecycle } from '../utils/service-provider'
import { MemoryCache } from '../utils/caching'
import SecretsClient from '../services/aws/SecretsClient'

import utilsProvider from './utils'

const awsProvider = new ServiceProvider()

export const SecretsClientWithoutCache =
  ServiceProvider.createSymbol<SecretsClient>('SecretsClientWithoutCache')

awsProvider.register(
  SecretsClient,
  Lifecycle.Singleton,
  () => new SecretsClient(utilsProvider.provide(MemoryCache)),
)

awsProvider.register(SecretsClientWithoutCache, Lifecycle.Singleton)

export default awsProvider
