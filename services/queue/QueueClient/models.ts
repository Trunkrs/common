export interface SQSMessageOptions {
  deduplicationId?: string
  messageGroupId?: string
  delaySeconds?: number
}

export interface SNSMessageOptions {
  deduplicationId?: string
  messageGroupId?: string
  messageDeduplicationId?: string
  attributes?: { [key: string]: string | number | boolean }
}

export interface EventBridgeMessageOptions {
  detailType?: string
  resources?: string[]
}

export interface KinesisMessageOptions {
  partitionKey?: string
  hashKey?: string
  sequenceNumber?: string
}

type MessageOptions =
  | SQSMessageOptions
  | SNSMessageOptions
  | EventBridgeMessageOptions
  | KinesisMessageOptions

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
