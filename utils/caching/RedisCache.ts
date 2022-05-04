import Cache, { CacheItem } from './Cache'
import RedisClient from '../../services/redis/RedisClient'
import { Serializer } from '../serialization'

class RedisCache extends Cache {
  public constructor(
    stalenessTimeout: number,
    private readonly client: RedisClient,
    private readonly serializer: Serializer,
  ) {
    super(stalenessTimeout)
  }

  public async add<TValue>(key: string, value: TValue): Promise<void> {
    const item = this.createItem(value)
    const serializedItem = this.serializer.serialize(item, 'string')

    await this.client.set(key, serializedItem, { expiresAt: item.expiration })
  }

  public async clear(): Promise<void> {
    await this.client.clear()
  }

  public async get<TValue>(key: string): Promise<TValue | null> {
    const item = await this.client.get(key)

    if (!item) {
      return null
    }

    const deserializedItem: CacheItem = this.serializer.deserialize(item)
    return deserializedItem.value as TValue
  }

  public async getOrAdd<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue> {
    console.info('[REDIS-CACHE]: attempting to get item')
    const item = await this.client.get(key)

    if (!item) {
      const newValue = await factory()

      console.info('[REDIS-CACHE]: item not found, running factory method')

      await this.add(key, newValue)

      return newValue
    }

    console.info('[REDIS-CACHE]: item found, returning value')
    const deserializedItem: CacheItem = this.serializer.deserialize(item)
    return deserializedItem.value as TValue
  }

  public async hasKey(key: string): Promise<boolean> {
    const item = await this.client.get(key)

    return !!item
  }

  public async remove(key: string): Promise<void> {
    await this.client.delete(key)
  }
}

export default RedisCache
