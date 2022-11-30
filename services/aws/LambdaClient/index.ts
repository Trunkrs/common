import { Serializer } from '../../utils/serialization'
import LambdaInvocationFailedError from './LambdaInvocationFailedError'

class LambdaClient<TResponse = unknown, TInvokeArgs = unknown> {
  public constructor(
    protected readonly functionArn: string,
    protected readonly serializer: Serializer,
    protected readonly lambdaInstance: AWS.Lambda
  ) {}

  public async invokeLambda(args?: TInvokeArgs): Promise<TResponse | void> {
    const serializedInput = !!args
      ? this.serializer.serialize(args, 'string')
      : undefined

    const result = await this.lambdaInstance.invoke({
      Payload: serializedInput,
      FunctionName: this.functionArn,
    }).promise()


    if (result.FunctionError) {
      throw new LambdaInvocationFailedError(result.FunctionError)
    }

    if (!result.Payload) {
      return
    }

    const deserializedResult = this.serializer.deserialize<TResponse>(
      Buffer.from(result.Payload as string)
    )

    return deserializedResult
  }
}

export default LambdaClient
