import {
  NoEventHandlerSetError,
  NoProviderError,
} from '../../../models/errors/handlers'
import ServiceProvider, { Constructor } from '../../service-provider'

import ControllerFactory from '../../controllers/ControllerFactory'

import EncapsulatedExpression from '../EncapsulatedExpression'
import { LambdaHandler } from './types'

class LambdaHandlerBuilder<TBody, TController> {
  protected controller?: Constructor<TController>

  protected actionExpression?: EncapsulatedExpression<TController>

  public static create(): LambdaHandlerBuilder<unknown, unknown> {
    return new LambdaHandlerBuilder()
  }

  /**
   * Registers a controller provider as the resolver for controllers in this endpoint.
   * @param provider The controller provider.
   */
  public withControllerProvider(
    provider: ServiceProvider,
  ): LambdaHandlerBuilder<TBody, TController> {
    ControllerFactory.registerProvider(provider)

    return this
  }

  /**
   * Defines the controller of this lambda handler.
   * @param controller The controller class of the handler.
   */
  public withController<TConstructor>(
    controller: Constructor<TConstructor>,
  ): LambdaHandlerBuilder<TBody, TConstructor> {
    this.controller = controller as unknown as Constructor<TController>
    return this as unknown as LambdaHandlerBuilder<TBody, TConstructor>
  }

  /**
   * Defines the action on the controller class.
   * @param expression The expression that points to the action.
   */
  public withAction<TActionResult = void>(
    expression: (
      controller: TController,
    ) => (
      event: TBody,
      context: AWSLambda.Context,
      callback: AWSLambda.Callback,
    ) => Promise<TActionResult>,
  ): LambdaHandlerBuilder<TBody, TController> {
    this.actionExpression = new EncapsulatedExpression<TController>()
    expression(this.actionExpression.asCapturable())

    return this as unknown as LambdaHandlerBuilder<TBody, TController>
  }

  /**
   * Builds a lambda handler based on the specified controller and action.
   */
  public build(): LambdaHandler<TBody> {
    if (!ControllerFactory.hasProvider()) {
      throw new NoProviderError()
    }

    if (!this.controller || !this.actionExpression) {
      throw new NoEventHandlerSetError()
    }

    return async (
      event: TBody,
      context: AWSLambda.Context,
      callback: AWSLambda.Callback,
    ): Promise<unknown> => {
      const instance = ControllerFactory.provide<any>(
        this.controller as Constructor<TController>,
      )

      return this.actionExpression?.invoke(instance, event, context, callback)
    }
  }
}

export default LambdaHandlerBuilder
