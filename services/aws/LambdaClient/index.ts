import {
  LambdaClient as AWSLambdaClient,
  InvokeCommand,
} from '@aws-sdk/client-lambda'

import { Serializer } from '../../../utils/serialization'
import LambdaInvocationFailedError from './LambdaInvocationFailedError'

class LambdaClient<TResponse = unknown, TInvokeArgs = unknown> {
  public constructor(
    protected readonly functionArn: string,
    protected readonly serializer: Serializer,
    protected readonly lambdaInstance: AWSLambdaClient,
  ) {}

  public async invokeLambda(args?: TInvokeArgs): Promise<TResponse | void> {
    const serializedInput = args
      ? this.serializer.serialize(args, 'string')
      : undefined

    const command = new InvokeCommand({
      Payload: serializedInput,
      FunctionName: this.functionArn,
    })

    const result = await this.lambdaInstance.send(command)

    if (result.FunctionError) {
      throw new LambdaInvocationFailedError(result.FunctionError)
    }

    if (!result.Payload) {
      return
    }

    const deserializedResult = this.serializer.deserialize<TResponse>(
      Buffer.from(result.Payload),
    )

    return deserializedResult
  }
}

export default LambdaClient
