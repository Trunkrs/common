import addMilliseconds from 'date-fns/addMilliseconds'
import {
  DeleteParameterCommand,
  DeleteParametersCommand,
  GetParameterCommand,
  GetParametersByPathCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm'
import Cache, { CacheItem } from './Cache'

export default class SSMCache extends Cache {
  public constructor(
    stalenessTimeout: number,
    private readonly ssmClient: SSMClient,
    private readonly storeName: string,
    private readonly cacheDomain = 'cache',
  ) {
    super(stalenessTimeout)
  }

  private getFullParameterName(key: string): string {
    return `/${this.cacheDomain}/${this.storeName}/${key}`
  }

  protected createItem<TValue>(rawValue: TValue): CacheItem {
    return {
      expiration: addMilliseconds(new Date(), this.stalenessTimeout),
      value: rawValue,
    }
  }

  public async hasKey(key: string): Promise<boolean> {
    const secret = await this.get(key)

    return !!secret
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

    const command = new PutParameterCommand({
      Name: this.getFullParameterName(key),
      Type: 'SecureString',
      Policies: JSON.stringify(expirationPolicy),
      Value: JSON.stringify(secret.value),
      Tier: 'Advanced',
    })

    await this.ssmClient.send(command)
  }

  public async get<TValue>(key: string): Promise<TValue | null> {
    try {
      const command = new GetParameterCommand({
        Name: this.getFullParameterName(key),
        WithDecryption: true,
      })

      const parameter = await this.ssmClient.send(command)

      if (!parameter.Parameter) {
        return null
      }

      const { Value: secretValue } = parameter.Parameter

      return secretValue ? JSON.parse(secretValue) : null
    } catch (e) {
      return null
    }
  }

  public async getOrAdd<TValue>(
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

  public async remove(key: string): Promise<void> {
    const command = new DeleteParameterCommand({
      Name: this.getFullParameterName(key),
    })

    await this.ssmClient.send(command)
  }

  public async clear(): Promise<void> {
    const getParametersByPathCommand = new GetParametersByPathCommand({
      Path: `/${this.cacheDomain}/${this.storeName}/`,
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
}
