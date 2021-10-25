import { DynamoDB } from 'aws-sdk'
import { AttributeMap } from 'aws-sdk/clients/dynamodb'

import { DynamoStreamRecord, MessageExtractor } from '../types'

const DynamoStreamExtractor: MessageExtractor<
  AWSLambda.DynamoDBStreamEvent,
  any
> = (event) => {
  return event.Records.map((record) => {
    return {
      type: record.eventName,
      data: DynamoDB.Converter.unmarshall(
        (record.dynamodb?.NewImage ??
          record.dynamodb?.OldImage) as AttributeMap,
      ),
    } as DynamoStreamRecord
  })
}

export default DynamoStreamExtractor
