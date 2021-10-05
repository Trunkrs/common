import { SNS } from 'aws-sdk'
import Serializer from '../../utils/serialization/Serializer'

import QueueClient from './QueueClient'
import {
  QueueBatchMessageRequest,
  QueueMessageRequest,
} from './QueueClient/models'

class SNSQueueClient implements QueueClient {
  private readonly client = new SNS()

  constructor(
    private readonly topicArn: string,
    private readonly serializer: Serializer
  ) {}

  public async sendMessage<TMessage>(
    request: QueueMessageRequest<TMessage>,
  ): Promise<void> {
    await this.client
      .publish({
        TopicArn: this.topicArn,
        Message: this.serializer.serialize(request.message, "string"),
        MessageGroupId:request.options?.messageGroupId,
        MessageDeduplicationId: request.options?.messageGroupId,
      })
      .promise()
  }

  public async sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage>,
  ): Promise<void> {
    const batchSendMessagePromises = request.messages.map((message) =>
      this.sendMessage({ message, options: request.options }),
    )

    await Promise.all(batchSendMessagePromises)
  }
}

export default SNSQueueClient
