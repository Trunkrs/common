export type LambdaHandler<TBody = unknown> = (
  event: TBody,
  context: AWSLambda.Context,
  callback: AWSLambda.Callback,
) => Promise<unknown>
