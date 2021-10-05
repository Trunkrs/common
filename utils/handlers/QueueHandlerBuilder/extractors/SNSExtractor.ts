import { MessageExtractor } from '../types'

const SNSExtractor: MessageExtractor<AWSLambda.SNSEvent, any> = (
  event: AWSLambda.SNSEvent,
  parseJSON: boolean,
) => {
  let message = event.Records[0].Sns.Message

  if (parseJSON) {
    message = JSON.parse(message)
  }

  return message
}

export default SNSExtractor
