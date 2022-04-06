import XRay from 'aws-xray-sdk'
import AWS from 'aws-sdk'
import StateMachineClient from './StateMachineClient'

const { StepFunctions } = XRay.captureAWS(AWS)

class StepFunctionsClient implements StateMachineClient {
  private readonly client = new StepFunctions()

  public constructor(private readonly stateMachineArn: string) {}

  public async startStateMachine<TInput = unknown>(
    input?: TInput,
  ): Promise<void> {
    const requestInput = input ? JSON.stringify(input) : undefined

    await this.client
      .startExecution({
        stateMachineArn: this.stateMachineArn,
        input: requestInput,
      })
      .promise()
  }
}

export default StepFunctionsClient
