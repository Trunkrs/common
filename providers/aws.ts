import ServiceProvider, { Lifecycle } from '../utils/service-provider'

import SecretsClient from '../services/aws/SecretsClient'

import utilsProvider, { MemoryCache } from './utils'

const awsProvider = new ServiceProvider()

awsProvider.register(
  SecretsClient,
  Lifecycle.Singleton,
  () => new SecretsClient(utilsProvider.provide(MemoryCache)),
)

export default awsProvider
