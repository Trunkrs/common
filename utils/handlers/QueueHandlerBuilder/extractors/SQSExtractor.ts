import { MessageExtractor } from '../types'

const SQSExtractor: MessageExtractor<AWSLambda.SQSEvent, any> = (
  event: AWSLambda.SQSEvent,
  parseJSON: boolean,
) => {
  return event.Records.map((record) => {
    let message = record.body

    if (parseJSON) {
      message = JSON.parse(message)
    }

    return message
  })
}

export default SQSExtractor
