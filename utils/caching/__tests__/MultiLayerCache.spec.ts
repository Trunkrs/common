import Cache from '../Cache'
import MultiLayerCache from '../MultiLayerCache'

class StubCache extends Cache {
  public readonly store = new Map<string, unknown>()

  public addMock = jest.fn(async (key: string, value: unknown) => {
    this.store.set(key, value)
  })

  public constructor(stalenessTimeout = 60000) {
    super(stalenessTimeout)
  }

  public async hasKey(key: string): Promise<boolean> {
    return this.store.has(key)
  }

  public async add<TValue>(key: string, value: TValue): Promise<void> {
    await this.addMock(key, value)
  }

  public async get<TValue>(key: string): Promise<TValue | null> {
    if (this.store.has(key)) {
      return this.store.get(key) as TValue
    }

    return null
  }

  public async getOrAdd<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue> {
    const hit = await this.get<TValue>(key)

    if (hit) {
      return hit
    }

    const value = await factory()
    await this.add(key, value)
    return value
  }

  public async remove(key: string): Promise<void> {
    this.store.delete(key)
  }

  public async clear(): Promise<void> {
    this.store.clear()
  }
}

describe('MultiLayerCache', () => {
  let layer: StubCache
  let cache: MultiLayerCache

  beforeEach(() => {
    layer = new StubCache()
    cache = new MultiLayerCache(60000, [layer])
  })

  describe('getOrAdd', () => {
    it('should only invoke the factory once for concurrent calls with the same key', async () => {
      const factory = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return 'fresh-value'
      })

      const results = await Promise.all([
        cache.getOrAdd('token', factory),
        cache.getOrAdd('token', factory),
        cache.getOrAdd('token', factory),
      ])

      expect(factory).toHaveBeenCalledTimes(1)
      expect(results).toEqual(['fresh-value', 'fresh-value', 'fresh-value'])
    })

    it('should still resolve with the factory value when the cache write fails', async () => {
      layer.addMock.mockRejectedValueOnce(new Error('TooManyUpdates'))

      const result = await cache.getOrAdd('token', async () => 'fresh-value')

      expect(result).toBe('fresh-value')
    })

    it('should reject all deduped callers when the factory fails and allow a retry afterwards', async () => {
      const failingFactory = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw new Error('upstream unavailable')
      })

      const attempts = [
        cache.getOrAdd('token', failingFactory),
        cache.getOrAdd('token', failingFactory),
      ]

      await expect(attempts[0]).rejects.toThrow('upstream unavailable')
      await expect(attempts[1]).rejects.toThrow('upstream unavailable')
      expect(failingFactory).toHaveBeenCalledTimes(1)

      const retryResult = await cache.getOrAdd('token', async () => 'recovered')

      expect(retryResult).toBe('recovered')
    })

    it('should not dedup calls for different keys', async () => {
      const factoryA = jest.fn(async () => 'value-a')
      const factoryB = jest.fn(async () => 'value-b')

      const [resultA, resultB] = await Promise.all([
        cache.getOrAdd('key-a', factoryA),
        cache.getOrAdd('key-b', factoryB),
      ])

      expect(resultA).toBe('value-a')
      expect(resultB).toBe('value-b')
      expect(factoryA).toHaveBeenCalledTimes(1)
      expect(factoryB).toHaveBeenCalledTimes(1)
    })

    it('should return the cached value without invoking the factory on a hit', async () => {
      await cache.add('token', 'cached-value')
      const factory = jest.fn(async () => 'fresh-value')

      const result = await cache.getOrAdd('token', factory)

      expect(result).toBe('cached-value')
      expect(factory).not.toHaveBeenCalled()
    })
  })
})
