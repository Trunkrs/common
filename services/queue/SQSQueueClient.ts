import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
} from '@aws-sdk/client-sqs'

import Serializer from '../../utils/serialization/Serializer'

import {
  QueueClient,
  QueueBatchMessageRequest,
  QueueMessageRequest,
  SQSMessageOptions,
} from './QueueClient'

class SQSQueueClient implements QueueClient {
  private readonly client = new SQSClient()

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
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: this.serializer.serialize(request.message, 'string'),
      MessageGroupId: request.options?.messageGroupId,
      MessageDeduplicationId: request.options?.messageGroupId,
      DelaySeconds: request.options?.delaySeconds,
    })

    await this.client.send(command)
  }

  public async sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage, SQSMessageOptions>,
  ): Promise<void> {
    const command = new SendMessageBatchCommand({
      QueueUrl: this.queueUrl,
      Entries: request.messages.map((message, index) => ({
        Id: String(index),
        MessageBody: this.serializer.serialize(message, 'string'),
        MessageGroupId: request.options?.messageGroupId,
        MessageDeduplicationId: request.options?.messageGroupId,
        DelaySeconds: request.options?.delaySeconds,
      })),
    })

    await this.client.send(command)
  }
}

export default SQSQueueClient
