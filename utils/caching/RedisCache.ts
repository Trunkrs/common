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

    const deSerializedItem: CacheItem = this.serializer.deserialize(item)
    return deSerializedItem.value as TValue
  }

  public async getOrAdd<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue> {
    const item = await this.client.get(key)

    if (!item) {
      const newValue = await factory()
      await this.add(key, newValue)

      return newValue
    }

    const deSerializedItem: CacheItem = this.serializer.deserialize(item)
    return deSerializedItem.value as TValue
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
