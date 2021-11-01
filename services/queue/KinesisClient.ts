import { Kinesis } from 'aws-sdk'

import { Serializer } from '../../utils/serialization'

import {
  QueueClient,
  KinesisMessageOptions,
  QueueBatchMessageRequest,
  QueueMessageRequest,
} from './QueueClient'

class KinesisClient implements QueueClient {
  private readonly client = new Kinesis()

  public constructor(
    /**
     * The kinesis stream name to publish events to.
     */
    private readonly streamName: string,
    /**
     * The serializer to use for message serialization.
     */
    private readonly serializer: Serializer,
    /**
     *  Default partition to send message into.
     *  Can be overridden on a per message basis in the message options.
     */
    private readonly defaultPartition: string,
  ) {}

  public async sendMessage<TMessage>(
    request: QueueMessageRequest<TMessage, KinesisMessageOptions>,
  ): Promise<void> {
    await this.client
      .putRecord({
        StreamName: this.streamName,
        Data: this.serializer.serialize(request.message, 'string'),
        PartitionKey: request.options?.partitionKey ?? this.defaultPartition,
        ExplicitHashKey: request.options?.hashKey,
        SequenceNumberForOrdering: request.options?.sequenceNumber,
      })
      .promise()
  }

  public async sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage, KinesisMessageOptions>,
  ): Promise<void> {
    await this.client.putRecords({
      StreamName: this.streamName,
      Records: request.messages.map((message) => ({
        Data: this.serializer.serialize(message, 'string'),
        PartitionKey: request.options?.partitionKey ?? this.defaultPartition,
        ExplicitHashKey: request.options?.hashKey,
        SequenceNumberForOrdering: request.options?.sequenceNumber,
      })),
    })
  }
}

export default KinesisClient
