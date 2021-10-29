export interface SQSMessageOptions {
  deduplicationId?: string
  messageGroupId?: string
}

export interface SNSMessageOptions {
  deduplicationId?: string
  messageGroupId?: string
  attributes?: { [key: string]: string | number | boolean }
}

export interface EventBridgeMessageOptions {
  detailType?: string
  resources?: string[]
}

type MessageOptions =
  | SQSMessageOptions
  | SNSMessageOptions
  | EventBridgeMessageOptions

export interface QueueMessageRequest<
  TMessage,
  TOptions extends MessageOptions = never,
> {
  message: TMessage
  options?: TOptions
}

export interface QueueBatchMessageRequest<
  TMessage,
  TOptions extends MessageOptions = never,
> {
  messages: TMessage[]
  options?: TOptions
}
