import { SNS } from 'aws-sdk'
import Serializer from '../../utils/serialization/Serializer'

import QueueClient from './QueueClient'
import {
  QueueBatchMessageRequest,
  QueueMessageRequest,
  SNSMessageOptions,
} from './QueueClient/models'

class SNSQueueClient implements QueueClient {
  private static translateJStypeToSNSType(typeName: string): string {
    switch (typeName) {
      case 'string':
        return 'String'
      case 'number':
        return 'Number'
      case 'boolean':
        return 'Boolean'
      default:
        return 'string'
    }
  }

  private readonly client = new SNS()

  constructor(
    private readonly topicArn: string,
    private readonly serializer: Serializer,
  ) {}

  public async sendMessage<TMessage>(
    request: QueueMessageRequest<TMessage, SNSMessageOptions>,
  ): Promise<void> {
    // Turn optional message attributes into SNS equivalents
    const attributes = request.options?.attributes
      ? Object.keys(request.options?.attributes).reduce(
          (keyMap, attrKey) =>
            Object.assign(keyMap, {
              [attrKey]: {
                DataType: SNSQueueClient.translateJStypeToSNSType(
                  typeof request.options?.attributes?.[attrKey],
                ),
                StringValue: String(request.options?.attributes?.[attrKey]),
              },
            }),
          {} as { [key: string]: SNS.Types.MessageAttributeValue },
        )
      : {}

    await this.client
      .publish({
        TopicArn: this.topicArn,
        Message: this.serializer.serialize(request.message, 'string'),
        MessageGroupId: request.options?.messageGroupId,
        MessageDeduplicationId: request.options?.messageGroupId,
        MessageAttributes: attributes,
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
