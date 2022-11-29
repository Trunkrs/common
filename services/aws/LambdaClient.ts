import {Serializer} from '../../utils/serialization'

class LambdaClient<TInvokeArgs, TResponse> {
  public constructor(
    protected readonly functionArn: string,
    protected readonly serializer: Serializer,
    protected readonly lambdaInstance: AWS.Lambda
  ) {}

  public async invokeLambda(args?: TInvokeArgs): Promise<TResponse | void> {
    const serializedInput = this.serializer.serialize(args, 'string')

    const result = await this.lambdaInstance.invoke({
      Payload: serializedInput,
      FunctionName: this.functionArn,
    }).promise()

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
