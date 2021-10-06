import { SSM } from 'aws-sdk'
import addSeconds from 'date-fns/addSeconds'

import Logger from '../logging/Logger'

import { CacheItem } from './Cache'
import GlobalAtomicCache from './GlobalAtomicCache'

class SecretCache extends GlobalAtomicCache {
  private readonly ssmClient = new SSM()

  public constructor(
    storeName: string,
    mountPath: string,
    protected readonly stalenessTimeout: number,
    logger: Logger,
    private cacheDomain = 'cache'
  ) {
    super(stalenessTimeout, storeName, mountPath, logger)
  }

  public async add<TValue>(key: string, value: TValue): Promise<void> {
    const secret = this.createItem(value)
    const expirationPolicy = [
      {
        Type: 'Expiration',
        Version: '1.0',
        Attributes: {
          Timestamp: secret.expiration.toISOString(),
        },
      },
    ]

    await this.ssmClient
      .putParameter({
        Name: this.getFullParameterName(key),
        Type: 'SecureString',
        Policies: JSON.stringify(expirationPolicy),
        Value: JSON.stringify(secret.value),
        Tier: 'Advanced',
      })
      .promise()
  }

  public async get<TValue>(key: string): Promise<TValue | null> {
    try {
      const parameter = await this.ssmClient
        .getParameter({
          Name: this.getFullParameterName(key),
          WithDecryption: true,
        })
        .promise()

      if (!parameter.Parameter) {
        return null
      }

      const { Value: secretValue } = parameter.Parameter

      return secretValue ? JSON.parse(secretValue) : null
    } catch (e) {
      return null
    }
  }

  public async clear(): Promise<void> {
    const { Parameters: parameters } = await this.ssmClient
      .getParametersByPath({
        Path: `/portal-cache/${this.storeName}`,
      })
      .promise()

    if (!parameters) {
      return
    }
    const names = parameters
      .map((param) => param.Name || '')
      .filter((param) => !!param)

    await this.ssmClient
      .deleteParameters({
        Names: names,
      })
      .promise()
  }

  public async hasKey(key: string): Promise<boolean> {
    const secret = await this.get(key)

    return !!secret
  }

  public async remove(key: string): Promise<void> {
    await this.ssmClient
      .deleteParameter({
        Name: this.getFullParameterName(key),
      })
      .promise()
  }

  private getFullParameterName(key: string): string {
    return `/${this.cacheDomain}/${this.storeName}/${key}`
  }

  protected createItem<TValue>(rawValue: TValue): CacheItem {
    return {
      expiration: addSeconds(new Date(), this.stalenessTimeout),
      value: rawValue,
    }
  }
}

export default SecretCache
