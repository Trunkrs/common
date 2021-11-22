import HttpMethod from '../../models/enum/HttpMethod'
import ParamSource from '../../models/enum/ParamSource'
import { NoEventHandlerSetError } from '../../models/errors/handlers'

import ControllerFactory from './ControllerFactory'

interface ParameterDescriptor {
  source: ParamSource
  parameterKey?: string
}

interface HttpActionDescriptor {
  controller: any
  action: string | symbol
  httpMethod?: HttpMethod
  route?: string
  params: ParameterDescriptor[]
}

export interface ActionExecutionInput {
  headers: Record<string, any>
  route?: Record<string, any>
  query?: Record<string, any>
  context: Record<string, any>
  body?: Record<string, any>
}

class HttpControllerFactory {
  static #httpActionByRoute = new Map<string, HttpActionDescriptor>()

  static #httpActionByController = new Map<string, HttpActionDescriptor>()

  /**
   * Registers an HTTP action descriptor.
   * @param controller
   * @param action
   * @param httpMethod
   * @param route
   */
  public static registerAction(
    controller: any,
    action: string | symbol,
    httpMethod: HttpMethod,
    route: string,
  ): void {
    if (!route) return
    const routeKey = route.startsWith('/') ? route.substring(1) : route

    const actionKey = `${controller.name}.${String(action)}`
    const newDescriptor = {
      ...(HttpControllerFactory.#httpActionByController.get(actionKey) ?? {
        params: [],
      }),
      controller,
      action,
      httpMethod,
      route,
    }

    HttpControllerFactory.#httpActionByRoute.set(
      `${httpMethod}:${routeKey}`,
      newDescriptor,
    )
    HttpControllerFactory.#httpActionByController.set(
      `${controller.name}.${String(action)}`,
      newDescriptor,
    )
  }

  /**
   * Registers a parameter for an action.
   * @param controller The controller constructor.
   * @param actionKey The action method key.
   * @param source The parameter source.
   * @param parameterKey The source key of the parameter.
   */
  public static registerActionParameter(
    controller: any,
    actionKey: string | symbol,
    source: ParamSource,
    parameterKey?: string,
  ): void {
    const actionIndexKey = `${controller.name}.${String(actionKey)}`
    const descriptor = HttpControllerFactory.#httpActionByController.get(
      actionIndexKey,
    ) ?? {
      controller,
      action: actionKey,
      params: [] as ParameterDescriptor[],
    }

    descriptor?.params.push({ source, parameterKey })

    HttpControllerFactory.#httpActionByController.set(
      actionIndexKey,
      descriptor,
    )
  }

  private static getParamSource(
    source: ParamSource,
    input: ActionExecutionInput,
  ): any | null {
    switch (source) {
      case ParamSource.Body:
        return input.body
      case ParamSource.Query:
        return input.query
      case ParamSource.Route:
        return input.route
      case ParamSource.Context:
        return input.context
      case ParamSource.Headers:
        return input.headers
      default:
        return null
    }
  }

  /**
   * Executes the action for the specified HTTP request.
   * @param method The method of the request.
   * @param route The requested resource route.
   * @param input The request input details.
   */
  public static executeAction<TResult>(
    method: HttpMethod,
    route: string,
    input: ActionExecutionInput,
  ): TResult {
    const descriptor = HttpControllerFactory.#httpActionByRoute.get(
      `${method.toUpperCase()}:${route}`,
    )

    if (!descriptor) {
      throw new NoEventHandlerSetError()
    }

    const controller = ControllerFactory.provide<any>(descriptor.controller)

    console.log('Route input: ', input)
    console.log('Route param descriptor: ', descriptor.params)

    const params: unknown[] = descriptor.params.map(
      ({ source, parameterKey }) => {
        const paramSource = HttpControllerFactory.getParamSource(source, input)
        return parameterKey ? (paramSource ?? {})[parameterKey] : paramSource
      },
    )

    console.log('Route params: ', params)

    // eslint-disable-next-line prefer-spread
    return controller[descriptor.action].apply(controller, params)
  }
}

export default HttpControllerFactory
