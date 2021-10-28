import { SecretsManager } from 'aws-sdk'

import Cache from '../../utils/caching/Cache'
import { Serializer } from '../../utils/serialization'

class SecretsClient {
  private readonly secretsManager = new SecretsManager()

  public constructor(private readonly cache: Cache, private readonly serializer: Serializer) {}

  public async getSecretValue<TValue>(secretName: string): Promise<TValue> {
    const secretValue = await this.cache.getOrAdd<TValue>(
      secretName,
      async () => {
        const secret = await this.secretsManager
          .getSecretValue({ SecretId: secretName })
          .promise()

        return JSON.parse(secret.SecretString as string)
      },
    )

    return secretValue
  }

  public async updateSecretValue<TValue>(
    secretName: string,
    secretValue: TValue,
  ): Promise<void> {
    const secretString = this.serializer.serialize(secretValue, 'string')
    await this.secretsManager.putSecretValue({
      SecretId: secretName,
      SecretString: secretString,
    })

    const isCacheNotEmpty = await this.cache.hasKey(secretName)
    if (isCacheNotEmpty) {
      await this.cache.remove(secretName)
    }

    await this.cache.add<TValue>(secretName, secretValue)
  }
}

export default SecretsClient
