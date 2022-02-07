import { SNS } from 'aws-sdk'
import { v1 as uuidV1 } from 'uuid'

import Serializer from '../../utils/serialization/Serializer'

import {
  QueueClient,
  QueueBatchMessageRequest,
  QueueMessageRequest,
  SNSMessageOptions,
} from './QueueClient'

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
        return 'String'
    }
  }

  private static translateAttributesToSNSAttributes(attributes: {
    [key: string]: string | number | boolean
  }): { [key: string]: SNS.MessageAttributeValue } {
    // Turn optional message attributes into SNS equivalents
    return Object.keys(attributes).reduce(
      (keyMap, attrKey) =>
        Object.assign(keyMap, {
          [attrKey]: {
            DataType: SNSQueueClient.translateJStypeToSNSType(
              typeof attributes[attrKey],
            ),
            StringValue: String(attributes[attrKey]),
          },
        }),
      {} as { [key: string]: SNS.Types.MessageAttributeValue },
    )
  }

  private readonly client = new SNS()

  constructor(
    /**
     * The ARN of the SNS topic to publish the messages to.
     */
    private readonly topicArn: string,
    /**
     * The serializer to use when serializing messages.
     */
    private readonly serializer: Serializer,
  ) {}

  public async sendMessage<TMessage>(
    request: QueueMessageRequest<TMessage, SNSMessageOptions>,
  ): Promise<void> {
    const attributes = request.options?.attributes
      ? SNSQueueClient.translateAttributesToSNSAttributes(
          request.options?.attributes,
        )
      : {}

    await this.client
      .publish({
        TopicArn: this.topicArn,
        Message: this.serializer.serialize(request.message, 'string'),
        MessageGroupId: request.options?.messageGroupId,
        MessageDeduplicationId: request.options?.messageDeduplicationId,
        MessageAttributes: attributes,
      })
      .promise()
  }

  public async sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage, SNSMessageOptions>,
  ): Promise<void> {
    const isPublishBatchSupported = this.client.publishBatch
    if (!isPublishBatchSupported) {
      const batchSendMessagePromises = request.messages.map((message) =>
        this.sendMessage({ message, options: request.options }),
      )

      await Promise.all(batchSendMessagePromises)

      return
    }

    const attributes = request.options?.attributes
      ? SNSQueueClient.translateAttributesToSNSAttributes(
          request.options?.attributes,
        )
      : {}

    const batchSendMessageEntries = request.messages.map((message) => ({
      Id: uuidV1(),
      Message: this.serializer.serialize(message, 'string'),
      MessageGroupId: request.options?.messageGroupId,
      MessageDeduplicationId: request.options?.messageDeduplicationId,
      MessageAttributes: attributes,
    }))

    await this.client
      .publishBatch({
        TopicArn: this.topicArn,
        PublishBatchRequestEntries: batchSendMessageEntries,
      })
      .promise()
  }
}

export default SNSQueueClient
