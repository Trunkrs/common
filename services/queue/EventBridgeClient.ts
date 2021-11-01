import { EventBridge } from 'aws-sdk'

import { Serializer } from '../../utils/serialization'

import QueueClient from './QueueClient'
import {
  EventBridgeMessageOptions,
  QueueBatchMessageRequest,
  QueueMessageRequest,
} from './QueueClient/models'

class EventBridgeClient implements QueueClient {
  private readonly client = new EventBridge()

  public constructor(
    /**
     * The serializer to use for serialization of message payloads.
     */
    private readonly serializer: Serializer,
    /**
     * The name of the sender source that will emit the messages.
     */
    private readonly sourceName?: string,
    /**
     * The bus name to which event are to be sent.
     */
    private readonly busName?: string,
    /**
     * Optional detail type for messages to be sent by this client.
     * This value can also be defined on a per emission basis in the message options.
     */
    private readonly detailType?: string,
  ) {}

  public async sendMessage<TMessage>(
    request: QueueMessageRequest<TMessage, EventBridgeMessageOptions>,
  ): Promise<void> {
    await this.client
      .putEvents({
        Entries: [
          {
            EventBusName: this.busName,
            Source: this.sourceName,
            DetailType: request.options?.detailType ?? this.detailType,
            Detail: this.serializer.serialize(request.message, 'string'),
            Resources: request.options?.resources,
          },
        ],
      })
      .promise()
  }

  public async sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage, EventBridgeMessageOptions>,
  ): Promise<void> {
    await this.client
      .putEvents({
        Entries: request.messages.map((message) => ({
          EventBusName: this.busName,
          Source: this.sourceName,
          DetailType: request.options?.detailType ?? this.detailType,
          Detail: this.serializer.serialize(message, 'string'),
          Resources: request.options?.resources,
        })),
      })
      .promise()
  }
}

export default EventBridgeClient
