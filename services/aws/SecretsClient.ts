import { SecretsManager } from 'aws-sdk'

import Cache from '../../utils/caching/Cache'

class SecretsClient {
  private readonly secretsManager = new SecretsManager()

  public constructor(private readonly cache: Cache) {}

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
    await this.secretsManager.putSecretValue({
      SecretId: secretName,
      SecretString: JSON.stringify(secretValue),
    })

    const isCacheNotEmpty = await this.cache.hasKey(secretName)
    if (isCacheNotEmpty) {
      await this.cache.remove(secretName)
    }

    await this.cache.add<TValue>(secretName, secretValue)
  }
}

export default SecretsClient
