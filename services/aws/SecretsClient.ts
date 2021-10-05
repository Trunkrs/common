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
}

export default SecretsClient
