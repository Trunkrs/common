import {
  SSMClient,
  PutParameterCommand,
  GetParameterCommand,
  GetParametersByPathCommand,
  DeleteParameterCommand,
  DeleteParametersCommand,
} from '@aws-sdk/client-ssm'
import addSeconds from 'date-fns/addSeconds'

import Logger from '../logging/Logger'

import { CacheItem } from './Cache'
import GlobalAtomicCache from './GlobalAtomicCache'

class SecretCache extends GlobalAtomicCache {
  private readonly ssmClient = new SSMClient()

  public constructor(
    storeName: string,
    mountPath: string,
    protected readonly stalenessTimeout: number,
    logger: Logger,
    private cacheDomain = 'cache',
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

    this.logger.info('[SecretCache] - Saving SSM Parameter', key, value)

    const command = new PutParameterCommand({
      Name: this.getFullParameterName(key),
      Type: 'SecureString',
      Policies: JSON.stringify(expirationPolicy),
      Value: JSON.stringify(secret.value),
      Tier: 'Advanced',
    })

    await this.ssmClient.send(command)

    this.logger.info('SSM parameter saved!')
  }

  public async get<TValue>(key: string): Promise<TValue | null> {
    try {
      this.logger.info('[SecretCache] - Fetching parameter', {
        name: this.getFullParameterName(key),
      })

      const command = new GetParameterCommand({
        Name: this.getFullParameterName(key),
        WithDecryption: true,
      })

      const parameter = await this.ssmClient.send(command)

      this.logger.info('[SecretCache] - Fetched parameter', {
        parameter: parameter?.Parameter,
      })
      if (!parameter.Parameter) {
        return null
      }

      const { Value: secretValue } = parameter.Parameter

      return secretValue ? JSON.parse(secretValue) : null
    } catch (e) {
      this.logger.error('[SecretCache] - Error', { error: e })
      return null
    }
  }

  public async clear(): Promise<void> {
    const getParametersByPathCommand = new GetParametersByPathCommand({
      Path: `/portal-cache/${this.storeName}`,
    })

    const { Parameters: parameters } = await this.ssmClient.send(
      getParametersByPathCommand,
    )

    if (!parameters) {
      return
    }

    const names = parameters
      .map((param) => param.Name || '')
      .filter((param) => !!param)

    const deleteParametersCommand = new DeleteParametersCommand({
      Names: names,
    })

    await this.ssmClient.send(deleteParametersCommand)
  }

  public async hasKey(key: string): Promise<boolean> {
    const secret = await this.get(key)

    return !!secret
  }

  public async remove(key: string): Promise<void> {
    const command = new DeleteParameterCommand({
      Name: this.getFullParameterName(key),
    })
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
