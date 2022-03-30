import { RedisClientType } from 'redis'

import SetOptions from './types/SetOptions'

class RedisClient {
  constructor(private readonly client: RedisClientType) {}

  /**
   * Sets a string at key, to be of value in the Redis Data Store
   * @param {string} key The key you want to value to be stored at.
   * @param {string} value The value to be stored at the specified key.
   * @param {SetOptions} options Options describing an expiration date or SetCondition (setting only if or if not the item exists)
   * @returns {void}
   */
  public async set(
    key: string,
    value: string,
    options?: SetOptions,
  ): Promise<void> {
    const commandOptions = {}

    if (options?.expiresAt) {
      Object.assign(commandOptions, {
        // sets expiration at a unix time in milliseconds
        PXAT: options.expiresAt.getTime(),
      })
    }

    if (options?.setCondition) {
      Object.assign(commandOptions, {
        [options.setCondition]: true,
      })
    }

    await this.client.connect()
    await this.client.set(key, value, commandOptions)
    await this.client.disconnect()
  }

  /**
   * Attempts to find a string value at the specified key.
   * Can return null
   * @param {string} key The key to find the specified string value at.
   * @returns {string | null}
   */
  public async get(key: string): Promise<string | null> {
    await this.client.connect()
    const item = await this.client.get(key)

    await this.client.disconnect()

    return item
  }

  /**
   * Tries to find a string value at the specified key. If none is found it
   * creates and stores a new string value with the provided factory() method.
   * Returns the item found/created
   * @param {string} key
   * @param {() => Promise<string>} factory
   * @param {SetOptions} setOptions Options describing an expiration date or SetCondition (setting only if or if not the item exists)
   * @returns {string}
   */
  public async getOrSet(
    key: string,
    factory: () => Promise<string>,
    setOptions?: SetOptions,
  ): Promise<string> {
    await this.client.connect()

    let value = await this.get(key)

    if (!value) {
      value = await factory()

      await this.set(key, value, setOptions)
    }

    await this.client.disconnect()

    return value
  }

  /**
   * Deletes all items specified by their key locations.
   * @param {string} keys
   * @returns {void}
   */
  public async delete(...keys: string[]): Promise<void> {
    await this.client.connect()
    await this.client.del(keys)
    await this.client.disconnect()
  }

  /**
   * Clears the entire cache of data.
   * @returns {void}
   */
  public async clear(): Promise<void> {
    await this.client.connect()
    await this.client.FLUSHALL()
    await this.client.disconnect()
  }
}

export default RedisClient
