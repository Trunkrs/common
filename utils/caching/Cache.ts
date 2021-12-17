import isBefore from 'date-fns/isBefore'
import addMilliseconds from 'date-fns/addMilliseconds'

export interface CacheItem {
  expiration: Date
  value: unknown
}

abstract class Cache {
  protected constructor(protected readonly stalenessTimeout: number) {}

  /**
   * Checks whether the cache can be hit by the specified key.
   * @param {string} key The cache key to check for
   * @returns {boolean} Whether cache can be hit by key.
   */
  public abstract hasKey(key: string): Promise<boolean>

  /**
   * Adds the value to the cache with the specified key.
   * @param {string} key The cache key to identify the cache entry.
   * @param value The cache value to store
   */
  public abstract add<TValue>(key: string, value: TValue): Promise<void>

  /**
   * Retrieves the cached value by it's key.
   * @param {string} key The cache key to retrieve the value for.
   * @returns The cached value or null when nothing hit.
   */
  public abstract get<TValue>(key: string): Promise<TValue | null>

  /**
   * Checks whether cached by key is hit, returns hit value.
   * When no hit then factory will create the cache value and returns it.
   * @param {string} key The cache key for the value.
   * @param {() => any} factory The factory method to create the value
   * @returns The cached or newly created value
   */
  public abstract getOrAdd<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue>

  /**
   * Removes the value from the cache by its key.
   * @param {string} key The key to remove value for from the cache.
   */
  public abstract remove(key: string): Promise<void>

  /**
   * Clears all items from the cache.
   */
  public abstract clear(): Promise<void>

  protected createItem<TValue>(rawValue: TValue): CacheItem {
    return {
      expiration: addMilliseconds(new Date(), this.stalenessTimeout),
      value: rawValue,
    }
  }

  protected isValidItem(item: CacheItem): boolean {
    return isBefore(new Date(), item.expiration)
  }
}

export default Cache
