import { SQS } from 'aws-sdk'
import QueueClient from './QueueClient'
import {
  QueueBatchMessageRequest,
  QueueMessageRequest,
} from './QueueClient/models'
import Serializer from '../../utils/serialization/Serializer'

class SNSQueueClient implements QueueClient {
  private readonly client = new SQS()

  constructor(
    private readonly queueUrl: string,
    private readonly serializer: Serializer
  ) {}

  public async sendMessage<TMessage>(
    request: QueueMessageRequest<TMessage>,
  ): Promise<void> {
    await this.client
      .sendMessage({
        QueueUrl: this.queueUrl,
        MessageBody: this.serializer.serialize(request.message, "string"),
        MessageGroupId: request.options?.messageGroupId,
        MessageDeduplicationId: request.options?.messageGroupId,
      })
      .promise()
  }

  public async sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage>,
  ): Promise<void> {
    await this.client.sendMessageBatch({
      QueueUrl: this.queueUrl,
      Entries: request.messages.map((message, index) => ({
        Id: String(index),
        MessageBody: this.serializer.serialize(message, "string"),
        MessageGroupId: request.options?.messageGroupId,
        MessageDeduplicationId: request.options?.messageGroupId,
      }))
    })
  }
}

export default SNSQueueClient
