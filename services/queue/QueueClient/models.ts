export interface QueueMessageRequestOptions {
  deduplicationId?: string
  messageGroupId?: string
}

export interface QueueMessageRequest<TMessage> {
  message: TMessage
  options?: QueueMessageRequestOptions
}

export interface QueueBatchMessageRequest<TMessage> {
  messages: TMessage[]
  options?: QueueMessageRequestOptions
}
