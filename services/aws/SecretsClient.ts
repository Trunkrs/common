import XRay from 'aws-xray-sdk'
import AWS from 'aws-sdk'

import Cache from '../../utils/caching/Cache'

const { SecretsManager } = XRay.captureAWS(AWS)

class SecretsClient {
  private readonly secretsManager = new SecretsManager()

  public constructor(private readonly cache?: Cache) {}

  public async getSecretValue(secretName: string): Promise<string | undefined> {
    const getSecret = async () => {
      const secret = await this.secretsManager
        .getSecretValue({ SecretId: secretName })
        .promise()

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
    await this.secretsManager
      .putSecretValue({
        SecretId: secretName,
        SecretString: secretValue,
      })
      .promise()

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
