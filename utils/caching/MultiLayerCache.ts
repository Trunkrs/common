/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import Cache from './Cache'

export default class MultiLayerCache extends Cache {
  public constructor(
    stalenessTimeout: number,
    private readonly layers: Cache[],
  ) {
    super(stalenessTimeout)
  }

  async hasKey(key: string): Promise<boolean> {
    for (const layer of this.layers) {
      if (await layer.hasKey(key)) {
        return true
      }
    }

    return false
  }

  async add<TValue>(key: string, value: TValue): Promise<void> {
    const addPromises = this.layers.map(async (l) => l.add(key, value))

    await Promise.all(addPromises)
  }

  async get<TValue>(key: string): Promise<TValue | null> {
    for (const layer of this.layers) {
      const potentialHit = await layer.get(key)

      if (potentialHit) {
        return potentialHit as TValue
      }
    }

    return null
  }

  async getOrAdd<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue> {
    const potentialHit = await this.get(key)

    if (potentialHit) {
      return potentialHit as TValue
    }

    const newValue = await factory()
    await this.add(key, newValue)
    return newValue
  }

  async remove(key: string): Promise<void> {
    const removalPromises = this.layers.map((l) => l.remove(key))

    await Promise.all(removalPromises)
  }

  async clear(): Promise<void> {
    const removalPromises = this.layers.map((l) => l.clear())

    await Promise.all(removalPromises)
  }
}
