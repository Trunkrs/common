import {
  KinesisClient as AWSKinesisClient,
  PutRecordCommand,
  PutRecordsCommand,
} from '@aws-sdk/client-kinesis'

import { Serializer } from '../../utils/serialization'

import {
  QueueClient,
  KinesisMessageOptions,
  QueueBatchMessageRequest,
  QueueMessageRequest,
} from './QueueClient'

class KinesisClient implements QueueClient {
  public constructor(
    /**
     * The kinesis client from the AWS SDK
     */
    private readonly client: AWSKinesisClient,
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
    const command = new PutRecordCommand({
      StreamName: this.streamName,
      Data: this.serializer.serialize(request.message, 'buffer'),
      PartitionKey: request.options?.partitionKey ?? this.defaultPartition,
      ExplicitHashKey: request.options?.hashKey,
      SequenceNumberForOrdering: request.options?.sequenceNumber,
    })

    await this.client.send(command)
  }

  public async sendBatchMessage<TMessage>(
    request: QueueBatchMessageRequest<TMessage, KinesisMessageOptions>,
  ): Promise<void> {
    const command = new PutRecordsCommand({
      StreamName: this.streamName,
      Records: request.messages.map((message) => ({
        Data: this.serializer.serialize(message, 'buffer'),
        PartitionKey: request.options?.partitionKey ?? this.defaultPartition,
        ExplicitHashKey: request.options?.hashKey,
        SequenceNumberForOrdering: request.options?.sequenceNumber,
      })),
    })

    await this.client.send(command)
  }
}

export default KinesisClient
