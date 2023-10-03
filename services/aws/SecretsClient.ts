import {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'

import Cache from '../../utils/caching/Cache'

class SecretsClient {
  private readonly secretsManager = new SecretsManagerClient()

  public constructor(private readonly cache?: Cache) {}

  public async getSecretValue(secretName: string): Promise<string | undefined> {
    const getSecret = async () => {
      const command = new GetSecretValueCommand({ SecretId: secretName })

      const secret = await this.secretsManager.send(command)

      return secret.SecretString
    }

    if (this.cache) {
      const secretValue = await this.cache.getOrAdd<string | undefined>(
        secretName,
        getSecret,
      )

      return secretValue
    }

    return getSecret()
  }

  public async updateSecretValue(
    secretName: string,
    secretValue: string,
  ): Promise<void> {
    const command = new PutSecretValueCommand({
      SecretId: secretName,
      SecretString: secretValue,
    })

    await this.secretsManager.send(command)

    if (this.cache) {
      const isCacheNotEmpty = await this.cache.hasKey(secretName)
      if (isCacheNotEmpty) {
        await this.cache.remove(secretName)
      }

      await this.cache.add(secretName, secretValue)
    }
  }
}

export default SecretsClient
