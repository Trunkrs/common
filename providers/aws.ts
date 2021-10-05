import ServiceProvider from '../utils/service-provider'
import { Lifecycle } from '../utils/service-provider/typings'

import SecretsClient from '../services/aws/SecretsClient'
import { MemoryCache } from '../utils/caching'

import utilsProvider from './utils'

const awsProvider = new ServiceProvider()

awsProvider.register(
  SecretsClient,
  Lifecycle.Singleton,
  () => new SecretsClient(utilsProvider.provide(MemoryCache)),
)

export default awsProvider
