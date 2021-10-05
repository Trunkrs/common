import { MessageExtractor } from '../types'

const EventBridgeExtractor: MessageExtractor<
  AWSLambda.EventBridgeEvent<string, any>,
  any
> = (event: AWSLambda.EventBridgeEvent<string, any>, parseJSON: boolean) => {
  let message =
    typeof event.detail === 'string'
      ? event.detail
      : JSON.stringify(event.detail)

  if (parseJSON) {
    message = JSON.parse(message)
  }

  return message
}

export default EventBridgeExtractor
