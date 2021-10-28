import SecretsClient from '../aws/SecretsClient'
import { AppClient } from '../../models/oauth'

import OAuthClient from './OAuthClient'

class MachineTokenClient {
  public constructor(
    protected readonly appClientSecretName: string,
    protected readonly secretsClient: SecretsClient,
    protected readonly oAuthClient: OAuthClient,
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
