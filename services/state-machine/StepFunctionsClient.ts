import { StepFunctions } from 'aws-sdk'
import StateMachineClient from './StateMachineClient'

class StepFunctionsClient implements StateMachineClient {
  private readonly client = new StepFunctions()

  public constructor(private readonly stateMachineArn: string) {}

  public async startStateMachine<TInput = unknown>(
    input?: TInput,
  ): Promise<void> {
    const requestInput = input ? JSON.stringify(input) : undefined

    await this.client.startExecution({
      stateMachineArn: this.stateMachineArn,
      input: requestInput,
    })
  }
}

export default StepFunctionsClient
