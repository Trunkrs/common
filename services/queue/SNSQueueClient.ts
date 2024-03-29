import {
  SNSClient,
  PublishCommand,
  PublishBatchCommand,
  MessageAttributeValue,
} from '@aws-sdk/client-sns'
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
  }): Record<string, MessageAttributeValue> {
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
      {},
    )
  }

  private readonly client = new SNSClient()

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

    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: this.serializer.serialize(request.message, 'string'),
      MessageGroupId: request.options?.messageGroupId,
      MessageDeduplicationId: request.options?.messageDeduplicationId,
      MessageAttributes: attributes,
    })

    await this.client.send(command)
  }

  public async sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage, SNSMessageOptions>,
  ): Promise<void> {
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

    const command = new PublishBatchCommand({
      TopicArn: this.topicArn,
      PublishBatchRequestEntries: batchSendMessageEntries,
    })

    await this.client.send(command)
  }
}

export default SNSQueueClient
