import SecretsClient from '../../aws/SecretsClient'

import { AppClient } from '../../../models/oauth'
import { Serializer } from '../../../utils/serialization'

import OAuthClient from '../OAuthClient'

import TokenNotFoundError from './TokenNotFoundError'

class MachineTokenClient {
  public constructor(
    protected readonly appClientSecretName: string,
    protected readonly secretsClient: SecretsClient,
    protected readonly oAuthClient: OAuthClient,
    protected readonly serializer: Serializer,
  ) {}

  public async getMachineToken(): Promise<string> {
    const serializedValue = await this.secretsClient.getSecretValue(
      this.appClientSecretName,
    )
    if (!serializedValue) {
      throw new TokenNotFoundError()
    }

    const clientDetails =
      this.serializer.deserialize<AppClient>(serializedValue)

    const { accessToken } = await this.oAuthClient.clientCredentialsFlow(
      clientDetails,
    )

    return accessToken
  }
}

export default MachineTokenClient
