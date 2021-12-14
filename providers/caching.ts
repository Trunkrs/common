import ServiceProvider, { Lifecycle } from '../utils/service-provider'
import { Cache, SecretCache } from '../utils/caching'
import utilsProvider, { Logger } from './utils'

export const DailyTokenCache =
  ServiceProvider.createSymbol<Cache>('DailyMachineCache')

/**
 * Configures a globally atomic daily token cache.
 * @param storeName The secret store name.
 * @param mountPath The EFS mount path for locking.
 */
export const configureDailyTokenCache = (
  storeName: string,
  mountPath: string,
): ServiceProvider => {
  const serviceProvider = new ServiceProvider()

  serviceProvider.register(
    DailyTokenCache,
    Lifecycle.Singleton,
    () =>
      new SecretCache(
        storeName,
        mountPath,
        3600 * 23, // 23 hours
        utilsProvider.provide(Logger),
      ),
  )

  return serviceProvider
}
