import ServiceProvider, {Lifecycle} from '../utils/service-provider'

import {ConsoleLogger, Logger as GenericLogger} from '../utils/logging'
import {
  InternalAPIQueryStringSerializer,
  JSONSerializer,
  Serializer as GenericSerializer,
} from '../utils/serialization'
import {MemoryCache} from '../utils/caching'

import {HttpClient as GenericHttpClient} from '../services/client/HttpClient'
import AxiosClient from '../services/client/AxiosClient'
import {OAuthClient} from '../services/client'

export const Logger = ServiceProvider.createSymbol<GenericLogger>('Logger')
export const Serializer =
  ServiceProvider.createSymbol<GenericSerializer>('Serializer')
export const HttpClient =
  ServiceProvider.createSymbol<GenericHttpClient>('HttpClient')

const utilsProvider = new ServiceProvider()

utilsProvider.register(HttpClient, Lifecycle.Transient, () => new AxiosClient())

utilsProvider.register(Logger, Lifecycle.Singleton, () => new ConsoleLogger())

utilsProvider.register(
  Serializer,
  Lifecycle.Singleton,
  () => new JSONSerializer(),
)

utilsProvider.register(MemoryCache, Lifecycle.Singleton)

utilsProvider.register(
  OAuthClient,
  Lifecycle.Singleton,
  () => new OAuthClient(utilsProvider.provide(HttpClient)),
)

utilsProvider.register(
  InternalAPIQueryStringSerializer,
  Lifecycle.Singleton,
  () => new InternalAPIQueryStringSerializer(),
)

export default utilsProvider
