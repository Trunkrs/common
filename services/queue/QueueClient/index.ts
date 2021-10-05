import { QueueBatchMessageRequest, QueueMessageRequest } from './models'

export interface QueueClient {
  /** Send a message through a queue
   * @param { QueueMessageRequest } request The message request
   * May be extended to include implementation specific configuration
   */
  sendMessage<TMessage>(request: QueueMessageRequest<TMessage>): Promise<void>

  /** Send a message in batch through a queue
   * @param { QueueBatchMessageRequest } request The message request
   */
  sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage>,
  ): Promise<void>
}

export default QueueClient
