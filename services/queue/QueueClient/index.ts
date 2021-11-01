import { QueueBatchMessageRequest, QueueMessageRequest } from './models'

export * from './models'

export interface QueueClient {
  /** Send a message through a queue
   * @param { QueueMessageRequest } request The message request
   * May be extended to include implementation specific configuration
   */
  sendMessage<TMessage, TOptions = never>(
    request: QueueMessageRequest<TMessage, TOptions>,
  ): Promise<void>

  /** Send a message in batch through a queue
   * @param { QueueBatchMessageRequest } request The message request
   */
  sendBatchMessage<TMessage, TOptions = never>(
    request: QueueBatchMessageRequest<TMessage, TOptions>,
  ): Promise<void>
}
