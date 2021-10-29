import { Serializer } from '../../utils/serialization'

import SecretsClient from '../aws/SecretsClient'
import { AppClient } from '../../models/oauth'

import OAuthClient from './OAuthClient'
import TokenNotFoundError from './MachineTokenClient/TokenNotFoundError'

class MachineTokenClient {
  public constructor(
    protected readonly appClientSecretName: string,
    protected readonly secretsClient: SecretsClient,
    protected readonly oAuthClient: OAuthClient,
    protected readonly serializer: Serializer,
  ) {}

  public async getMachineToken(): Promise<string> {
    const appClientValue = await this.secretsClient.getSecretValue(
      this.appClientSecretName,
    )

    if (!appClientValue) throw new TokenNotFoundError()

    const appClient = this.serializer.deserialize<AppClient>(appClientValue)
    const { accessToken } = await this.oAuthClient.clientCredentialsFlow(
      appClient,
    )

    return accessToken
  }
}

export default MachineTokenClient
