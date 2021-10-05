import SecretsClient from '../aws/SecretsClient'
import { AppClient } from '../../models/oauth'

import OAuthClient from './OAuthClient'

class MachineTokenClient {
  public constructor(
    private readonly appClientSecretName: string,
    private readonly secretsClient: SecretsClient,
    private readonly oAuthClient: OAuthClient,
  ) {}

  public async getMachineToken(): Promise<string> {
    const appClient = await this.secretsClient.getSecretValue<AppClient>(
      this.appClientSecretName,
    )

    const { accessToken } = await this.oAuthClient.clientCredentialsFlow(
      appClient,
    )

    return accessToken
  }
}

export default MachineTokenClient
