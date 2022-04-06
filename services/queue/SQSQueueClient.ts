import XRay from 'aws-xray-sdk'
import AWS from 'aws-sdk'

import Serializer from '../../utils/serialization/Serializer'

import {
  QueueClient,
  QueueBatchMessageRequest,
  QueueMessageRequest,
  SQSMessageOptions,
} from './QueueClient'

const { SQS } = XRay.captureAWS(AWS)

class SNSQueueClient implements QueueClient {
  private readonly client = new SQS()

  constructor(
    /**
     * The SQS queue url to use to publish messages to.
     */
    private readonly queueUrl: string,
    /**
     * The serializer to use when publishing messages.
     */
    private readonly serializer: Serializer,
  ) {}

  public async sendMessage<TMessage>(
    request: QueueMessageRequest<TMessage, SQSMessageOptions>,
  ): Promise<void> {
    await this.client
      .sendMessage({
        QueueUrl: this.queueUrl,
        MessageBody: this.serializer.serialize(request.message, 'string'),
        MessageGroupId: request.options?.messageGroupId,
        MessageDeduplicationId: request.options?.messageGroupId,
      })
      .promise()
  }

  public async sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage, SQSMessageOptions>,
  ): Promise<void> {
    await this.client.sendMessageBatch({
      QueueUrl: this.queueUrl,
      Entries: request.messages.map((message, index) => ({
        Id: String(index),
        MessageBody: this.serializer.serialize(message, 'string'),
        MessageGroupId: request.options?.messageGroupId,
        MessageDeduplicationId: request.options?.messageGroupId,
      })),
    })
  }
}

export default SNSQueueClient
