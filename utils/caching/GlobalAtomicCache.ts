import { promises as fs, watch } from 'fs'
import * as path from 'path'
import Cache from './Cache'
import Logger from '../logging/Logger'

interface FSError {
  errno: number
  code: string
  syscall: string
  path: string
}

abstract class GlobalAtomicCache extends Cache {
  private readonly fetchers = new Map<string, Promise<unknown>>()

  protected constructor(
    stalenessTimeout: number,
    protected readonly storeName: string,
    protected readonly mountPath: string,
    protected readonly logger: Logger,
  ) {
    super(stalenessTimeout)
  }

  private getLockFilePath(key: string): string {
    const lockfilePath = path.join(
      this.mountPath,
      `portal-${this.storeName}-${key}.lck`,
    )
    this.logger.info('[GlobalAtomicCache] - Getting lockfile path', {
      lockfilePath,
    })
    return path.join(this.mountPath, `portal-${this.storeName}-${key}.lck`)
  }

  private async isLockFilePresent(key: string): Promise<boolean> {
    try {
      await fs.access(this.getLockFilePath(key))

      return true
    } catch (e) {
      return false
    }
  }

  private async deleteLockFile(key: string): Promise<void> {
    const isLockFilePresent = await this.isLockFilePresent(key)

    if (isLockFilePresent) {
      try {
        await fs.unlink(this.getLockFilePath(key))
      } catch (error) {
        const fsError = error as FSError

        if (fsError.code === 'ENOENT') {
          this.logger.warn(
            'File unlink ignored. Probably a rights issue again. Please fix ASAP.',
          )
        } else {
          throw error
        }
      }
    }
  }

  private async setLockFile(key: string): Promise<void> {
    const file = await fs.open(this.getLockFilePath(key), 'wx')
    await file.close()
  }

  private async waitOrDeleteLock(key: string): Promise<void> {
    const watcher = watch(this.getLockFilePath(key))

    const watchPromise = new Promise((resolve) => {
      this.logger.info('[GlobalAtomicCache] - Deleting lockfile', { key })
      watcher.on('change', async () => {
        const isLockFilePresent = await this.isLockFilePresent(key)

        if (!isLockFilePresent) {
          resolve(true)
          this.logger.info('[GlobalAtomicCache] - Lockfile deleted', { key })
        }
      })
    })

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(async () => {
        await this.deleteLockFile(key)
        resolve(true)
      }, 3000),
    )

    await Promise.race([watchPromise, timeoutPromise])

    watcher.close()
  }

  private async executeFactoryAtomically<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue> {
    const isLockFilePresent = await this.isLockFilePresent(key)
    this.logger.info('[GlobalAtomicCache] - Checking file existence', {
      isLockFilePresent,
    })
    if (isLockFilePresent) {
      await this.waitOrDeleteLock(key)
      return this.getOrAdd(key, factory)
    }

    const value = await this.get<TValue>(key)
    if (value) {
      return value
    }

    try {
      await this.setLockFile(key)

      const factoryResult = await factory()
      await this.add(key, factoryResult)

      return factoryResult
    } finally {
      await this.deleteLockFile(key)
    }
  }

  public async getOrAdd<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue> {
    const fetcher = this.fetchers.get(key)
    this.logger.info('[GlobalAtomicCache] - Getting or adding cached value', {
      fetchers: this.fetchers,
      key,
    })
    if (fetcher) {
      return fetcher as Promise<TValue>
    }

    const factoryPromise = this.executeFactoryAtomically(key, factory).then(
      (result) => {
        this.fetchers.delete(key)
        return result
      },
    )
    this.fetchers.set(key, factoryPromise as Promise<unknown>)

    return factoryPromise
  }
}

export default GlobalAtomicCache
