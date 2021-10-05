import * as os from 'os'
import * as path from 'path'
import { promises as fs } from 'fs'
import { v1 as uuidV1 } from 'uuid'

import Cache, { CacheItem } from './Cache'
import Serializer from '../serialization/Serializer'

class FileCache extends Cache {
  private readonly storePath: string

  public constructor(
    private readonly serializer: Serializer,
    stalenessTimeout: number,
    storeScope: string | null = null,
    storeBasePath = os.tmpdir(),
  ) {
    super(stalenessTimeout)

    const scope = storeScope ?? uuidV1()
    this.storePath = path.join(storeBasePath, scope)
  }

  public async hasKey(key: string): Promise<boolean> {
    const keyPath = await this.createPath(key)

    return fs
      .access(keyPath)
      .then(() => true)
      .catch(() => false)
  }

  public async add<TValue>(key: string, value: TValue): Promise<void> {
    const cacheItem = this.createItem(value)
    const serialized = this.serializer.serialize(cacheItem, 'buffer')
    const keyPath = await this.createPath(key)

    await fs.writeFile(keyPath, serialized)
  }

  public async get<TValue>(key: string): Promise<TValue | null> {
    const keyPath = await this.createPath(key)
    try {
      const data = await fs.readFile(keyPath)
      const cachedItem = this.serializer.deserialize<CacheItem>(data)

      return cachedItem && this.isValidItem(cachedItem)
        ? (cachedItem?.value as TValue | null)
        : null
    } catch (error) {
      return null
    }
  }

  public async getOrAdd<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue> {
    let data = await this.get<TValue>(key)
    if (!data) {
      data = await factory()
      await this.add(key, data)
    }

    return data
  }

  public async remove(key: string): Promise<void> {
    const keyPath = await this.createPath(key)
    await fs.rm(keyPath).catch(() => Promise.resolve())
  }

  public async clear(): Promise<void> {
    const isStorePathReady = await this.isStorePathReady()
    if (!isStorePathReady) {
      return
    }

    await fs.rmdir(this.storePath, { recursive: true })
    await fs.mkdir(this.storePath)
  }

  private async createPath(key: string): Promise<string> {
    const isStorePathReady = await this.isStorePathReady()

    if (!isStorePathReady) {
      await fs.mkdir(this.storePath)
    }

    return path.join(this.storePath, key)
  }

  private async isStorePathReady(): Promise<boolean> {
    try {
      await fs.access(this.storePath)

      return true
    } catch (e) {
      return false
    }
  }
}

export default FileCache
