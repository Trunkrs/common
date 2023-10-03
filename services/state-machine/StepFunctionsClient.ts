import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn'

import StateMachineClient from './StateMachineClient'

class StepFunctionsClient implements StateMachineClient {
  private readonly client = new SFNClient()

  public constructor(private readonly stateMachineArn: string) {}

  public async startStateMachine<TInput = unknown>(
    input?: TInput,
  ): Promise<void> {
    const requestInput = input ? JSON.stringify(input) : undefined

    const command = new StartExecutionCommand({
      stateMachineArn: this.stateMachineArn,
      input: requestInput,
    })

    await this.client.send(command)
  }
}

export default StepFunctionsClient
