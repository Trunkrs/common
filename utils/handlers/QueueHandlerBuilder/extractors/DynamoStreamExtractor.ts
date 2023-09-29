import type { DynamoDBStreamEvent } from 'aws-lambda'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'

import { unmarshall } from '@aws-sdk/util-dynamodb'

import { MessageExtractor } from '../types'

const DynamoStreamExtractor: MessageExtractor<DynamoDBStreamEvent, any> = (
  event,
) => {
  return event.Records.map((record) => {
    return {
      type: record.eventName,
      data: unmarshall(
        (record.dynamodb?.NewImage ?? record.dynamodb?.OldImage) as Record<
          string,
          AttributeValue
        >,
      ),
    }
  })
}

export default DynamoStreamExtractor
