import { SecretsManager } from 'aws-sdk'

import Cache from '../../utils/caching/Cache'

class SecretsClient {
  private readonly secretsManager = new SecretsManager()

  public constructor(private readonly cache: Cache) {}

  public async getSecretValue(secretName: string): Promise<string | undefined> {
    const secretValue = await this.cache.getOrAdd<string | undefined>(
      secretName,
      async () => {
        const secret = await this.secretsManager
          .getSecretValue({ SecretId: secretName })
          .promise()

        return secret.SecretString
      },
    )

    return secretValue
  }

  public async updateSecretValue(
    secretName: string,
    secretValue: string,
  ): Promise<void> {
    await this.secretsManager.putSecretValue({
      SecretId: secretName,
      SecretString: secretValue,
    })

    const isCacheNotEmpty = await this.cache.hasKey(secretName)
    if (isCacheNotEmpty) {
      await this.cache.remove(secretName)
    }

    await this.cache.add(secretName, secretValue)
  }
}

export default SecretsClient
