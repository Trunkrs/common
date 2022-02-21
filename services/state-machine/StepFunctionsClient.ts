import { SecretsManager, StepFunctions } from 'aws-sdk'
import StateMachineClient from './StateMachineClient'
import StartStateMachineRequest from './StateMachineClient/StartStateMachineRequest'

class StepFunctionsClient implements StateMachineClient {
  private readonly client = new StepFunctions()

  public constructor(private readonly stateMachineArn: string) {}

  public async startStateMachine<
    TRequest extends StartStateMachineRequest<TInput>,
    TInput = unknown,
  >(request?: TRequest): Promise<void> {
    const requestInput = request?.input
    const input = requestInput ? JSON.stringify(requestInput) : undefined

    await this.client.startExecution({
      stateMachineArn: this.stateMachineArn,
      input,
    })
  }
}

export default StepFunctionsClient
