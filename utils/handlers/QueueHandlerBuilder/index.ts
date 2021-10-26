import {
  NoEventHandlerSetError,
  NoProviderError,
} from '../../../models/errors/handlers'

import SNSExtractor from './extractors/SNSExtractor'
import SQSExtractor from './extractors/SQSExtractor'
import EventBridgeExtractor from './extractors/EventBridgeExtractor'
import DynamoStreamExtractor from './extractors/DynamoStreamExtractor'

import ControllerFactory from '../../controllers/ControllerFactory'

import { Constructor } from '../../service-provider'
import LambdaHandlerBuilder from '../LambdaHandlerBuilder'

import { DynamoStreamRecord, MessageExtractor } from './types'

class QueueHandlerBuilder<
  TMessage,
  TBody,
  TController,
> extends LambdaHandlerBuilder<TBody, TController> {
  #parseJSON = false

  private constructor(
    private readonly messageExtractor: MessageExtractor<TMessage, TBody>,
  ) {
    super()
  }

  /**
   * Creates an SNS topic handler builder.
   */
  public static createSNS(): QueueHandlerBuilder<
    AWSLambda.SNSEvent,
    string,
    unknown
  > {
    return new QueueHandlerBuilder<AWSLambda.SNSEvent, string, unknown>(
      SNSExtractor,
    )
  }

  /**
   * Creates an SQS queue handler builder.
   */
  public static createSQS(): QueueHandlerBuilder<
    AWSLambda.SQSEvent,
    string[],
    unknown
  > {
    return new QueueHandlerBuilder<AWSLambda.SQSEvent, string[], unknown>(
      SQSExtractor,
    )
  }

  /**
   * Creates an EventBridge hub handler builder.
   * @param detailType The detail type of the message.
   */
  public static createEventBridge<TDetailType extends string, TDetail>(
    detailType: TDetailType,
  ): QueueHandlerBuilder<
    AWSLambda.EventBridgeEvent<TDetailType, TDetail>,
    string,
    unknown
  > {
    return new QueueHandlerBuilder<
      AWSLambda.EventBridgeEvent<TDetailType, TDetail>,
      string,
      unknown
    >(EventBridgeExtractor)
  }

  /**
   * Creates a DynamoDB Streams handler builder.
   */
  public static createDynamoStream(): QueueHandlerBuilder<
    AWSLambda.DynamoDBStreamEvent,
    string[],
    unknown
  > {
    return new QueueHandlerBuilder<
      AWSLambda.DynamoDBStreamEvent,
      string[],
      unknown
    >(DynamoStreamExtractor)
  }

  /**
   * Enables JSON parsing for the message.
   */
  public withJSONParsing<TParsedBody>(): QueueHandlerBuilder<
    TMessage,
    TMessage extends AWSLambda.DynamoDBStreamEvent
      ? DynamoStreamRecord<TParsedBody>[]
      : TParsedBody,
    TController
  > {
    this.#parseJSON = true
    return this as any
  }

  /**
   * Builds a lambda handler based on the specified controller and action.
   */
  public build() {
    if (!ControllerFactory.hasProvider()) {
      throw new NoProviderError()
    }

    if (!this.controller || !this.actionExpression) {
      throw new NoEventHandlerSetError()
    }

    const handler = async (
      event: TMessage,
      context: AWSLambda.Context,
      callback: AWSLambda.Callback,
    ): Promise<unknown> => {
      const queueEvent = this.messageExtractor(event, this.#parseJSON)
      const instance = ControllerFactory.provide<any>(
        this.controller as Constructor<TController>,
      )

      return this.actionExpression?.invoke(
        instance,
        queueEvent,
        context,
        callback,
      )
    }

    return handler as any
  }
}

export default QueueHandlerBuilder
