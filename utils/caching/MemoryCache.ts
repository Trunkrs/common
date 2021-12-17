import Cache, { CacheItem } from './Cache'

class MemoryCache extends Cache {
  protected readonly cache: Map<string, CacheItem> = new Map<string, CacheItem>()

  public constructor(stalenessTimeout = 0) {
    super(stalenessTimeout)
  }

  public hasKey(key: string): Promise<boolean> {
    const cachedItem = this.cache.get(key)
    const result = !!cachedItem && this.isValidItem(cachedItem)

    return Promise.resolve(result)
  }

  public add<TValue>(key: string, value: TValue): Promise<void> {
    this.cache.set(key, this.createItem(value))

    return Promise.resolve()
  }

  public get<TValue>(key: string): Promise<TValue | null> {
    const cachedItem = this.cache.get(key)
    const isValid = cachedItem && this.isValidItem(cachedItem)

    if (!isValid) {
      if (cachedItem) {
        this.remove(key)
      }

      return Promise.resolve(null)
    }

    return Promise.resolve(cachedItem?.value) as Promise<TValue | null>
  }

  public async getOrAdd<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue> {
    const cachedItem = this.cache.get(key)
    const isValid = cachedItem && this.isValidItem(cachedItem)

    if (!isValid) {
      const value = await factory()
      this.cache.set(key, this.createItem(value))

      return value
    }

    return cachedItem?.value as TValue
  }

  public remove(key: string): Promise<void> {
    this.cache.delete(key)
    return Promise.resolve()
  }

  public clear(): Promise<void> {
    this.cache.clear()
    return Promise.resolve()
  }
}

export default MemoryCache
