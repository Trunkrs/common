import { parse as parseQueryString } from 'qs'
import * as Joi from 'joi'
import { all as deepMerge } from 'deepmerge'

import utilsProvider, {
  Logger as LoggerSymbol,
  Serializer as SerializerSymbol,
} from '../../../providers/utils'
import { Logger } from '../../logging'
import { Serializer } from '../../serialization'
import HttpControllerFactory, {
  ActionExecutionInput,
} from '../../controllers/HttpControllerFactory'
import Tracing from '../../tracing'

import {
  HTTPLambdaHandler,
  HTTPResult,
  MiddlewareLayer,
  SchemaFactory,
} from './types'

import {
  ValidationError,
  NoProviderError,
} from '../../../models/errors/handlers'
import { HttpError } from '../../../models/errors/http'

import HttpMethod from '../../../models/enum/HttpMethod'
import ServiceProvider from '../../service-provider'
import ControllerFactory from '../../controllers/ControllerFactory'

// {} specifically chosen to satisfy object constraint, but is still... very empty.
class HttpHandlerBuilder<TContext, TInput> {
  readonly #middlewareLayers: MiddlewareLayer[] = []

  #schema?: Joi.ObjectSchema<TInput> | SchemaFactory<TContext, TInput>

  #useQueryInput = false

  #useBodyInput = false

  /**
   * Creates a new http lambda handler builder instance.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public static create(): HttpHandlerBuilder<{}, {}> {
    const logger = utilsProvider.provide<Logger>(LoggerSymbol)
    const serializer = utilsProvider.provide<Serializer>(SerializerSymbol)

    return new HttpHandlerBuilder(logger, serializer)
  }

  private constructor(
    private readonly logger: Logger,
    private readonly serializer: Serializer,
  ) {}

  /**
   * Registers a HTTP controller provider as the resolver for controllers in this endpoint.
   * This method can be called multiple times of more then one controller needs to be registered.
   * @param provider The controller provider.
   */
  public withControllerProvider(
    provider: ServiceProvider,
  ): HttpHandlerBuilder<TContext, TInput> {
    ControllerFactory.registerProvider(provider)

    return this
  }

  /**
   * Assign a middleware function to the HTTP event Action. Will ran before a supplied
   * Action is ran.
   * @param layer
   */
  public withMiddleware<TMiddlewareResult>(
    layer: MiddlewareLayer<TContext, TMiddlewareResult>,
  ): HttpHandlerBuilder<TMiddlewareResult & TContext, TInput> {
    this.#middlewareLayers.push(layer)

    return this as unknown as HttpHandlerBuilder<
      TMiddlewareResult & TContext,
      TInput
    >
  }

  /**
   * Use the query parameters as input to your HTTP event Action.
   * Query parameter field values can only be strings.
   * Body input will be disabled
   * @param schema
   */
  public withQueryInput<TValidatedSchema>(
    schema:
      | Joi.ObjectSchema<TValidatedSchema>
      | SchemaFactory<TContext, TValidatedSchema>,
  ): HttpHandlerBuilder<TContext, TValidatedSchema> {
    this.#useBodyInput = false
    this.#useQueryInput = true

    this.#schema = schema as unknown as Joi.ObjectSchema<TInput>

    return this as unknown as HttpHandlerBuilder<TContext, TValidatedSchema>
  }

  /**
   * Use the body parameter as input to your HTTP event Action.
   * Query input will be disabled.
   * @param schema
   */
  public withBodyInput<TValidatedSchema>(
    schema:
      | Joi.ObjectSchema<TValidatedSchema>
      | SchemaFactory<TContext, TValidatedSchema>,
  ): HttpHandlerBuilder<TContext, TValidatedSchema> {
    this.#useBodyInput = true
    this.#useQueryInput = false

    this.#schema = schema as unknown as Joi.ObjectSchema<TInput>

    return this as unknown as HttpHandlerBuilder<TContext, TValidatedSchema>
  }

  /**
   * Builds the http lambda handler.
   */
  public build(): HTTPLambdaHandler {
    if (!ControllerFactory.hasProvider()) {
      throw new NoProviderError()
    }

    return async (
      event: AWSLambda.APIGatewayProxyEventV2,
    ): Promise<AWSLambda.APIGatewayProxyResultV2> =>
      Tracing.hookRequestCycle(event, async () => {
        try {
          const convertedEvent = await this.proxyEventToActionInput(event)
          const [method, route] = this.extractActionInfo(event)

          const result = await HttpControllerFactory.executeAction<
            HTTPResult | undefined
          >(method, route, convertedEvent)

          if (!result) {
            return this.formatSuccessResult(204)
          }

          const { statusCode, body, headers } = result
          return this.formatSuccessResult(statusCode, headers, body)
        } catch (error) {
          return this.formatErrorResult(error)
        }
      })
  }

  private extractActionInfo(
    event: AWSLambda.APIGatewayProxyEventV2,
  ): [HttpMethod, string] {
    const {
      routeKey,
      requestContext: {
        http: { method },
      },
    } = event
    const route = routeKey.substring(routeKey.indexOf(' ') + 1)

    return [
      method as HttpMethod,
      route.startsWith('/') ? route.substring(1) : route,
    ]
  }

  private async proxyEventToActionInput(
    event: AWSLambda.APIGatewayProxyEventV2,
  ): Promise<ActionExecutionInput> {
    const middlewareContext = await this.executeMiddleWare(event)

    let input = {}
    if (this.#useQueryInput) {
      input = parseQueryString(event.rawQueryString)
    } else if (event.body) {
      input = this.serializer.deserialize(event.body)
    }

    if (this.#schema) {
      input = await HttpHandlerBuilder.validateSchema(
        this.#schema,
        middlewareContext,
        input,
      )
    }

    return {
      headers: event.headers,
      body: input,
      route: event.pathParameters,
      query: event.queryStringParameters,
      context: middlewareContext,
    }
  }

  private static async validateSchema<TSchema>(
    schema: Joi.ObjectSchema<TSchema> | SchemaFactory<any, TSchema>,
    context: unknown,
    toBeValidatedObject: unknown,
  ): Promise<TSchema> {
    let createdSchema = schema
    if (typeof createdSchema === 'function') {
      createdSchema = (schema as SchemaFactory<any, TSchema>)(context)
    }

    const result = createdSchema.validate(toBeValidatedObject)

    if (result.error) {
      throw new ValidationError(result.error)
    }

    return result.value
  }

  private async executeMiddleWare(
    event: AWSLambda.APIGatewayProxyEventV2,
  ): Promise<TContext> {
    let context = {}

    for (
      let middlewareIdx = 0;
      middlewareIdx < this.#middlewareLayers.length;
      middlewareIdx += 1
    ) {
      const { [middlewareIdx]: middlewareLayer } = this.#middlewareLayers

      // eslint-disable-next-line no-await-in-loop
      const newContext = await middlewareLayer(event, context)

      context = deepMerge([context, newContext])
    }

    return context as TContext
  }

  private formatSuccessResult(
    statusCode: number,
    headers?: { [key: string]: string },
    body?: any,
  ): AWSLambda.APIGatewayProxyResultV2 {
    switch (typeof body) {
      case 'object':
        if (body instanceof Buffer) {
          return {
            statusCode,
            headers: headers ?? {},
            body: body.toString('base64'),
            isBase64Encoded: true,
          }
        }

        return {
          statusCode,
          body: this.serializer.serialize(body, 'string'),
          headers: {
            ...(headers ?? {}),
            'Content-Type': 'application/json',
          },
        }

      case 'string':
        return {
          isBase64Encoded: true,
          headers: headers ?? {},
          body,
          statusCode,
        }

      case 'number':
      case 'symbol':
      case 'boolean':
        return {
          statusCode,
          headers: headers ?? {},
          body: String(body),
        }

      default:
        return {
          statusCode,
          headers: headers ?? {},
        }
    }
  }

  private formatErrorResult(error: unknown): AWSLambda.APIGatewayProxyResultV2 {
    this.logger.error(error)

    if (error instanceof HttpError) {
      const potentialBody = error.getBody()

      return {
        statusCode: error.statusCode,
        body: potentialBody
          ? this.serializer.serialize(potentialBody, 'string')
          : undefined,
      }
    }

    return {
      statusCode: 500,
    }
  }
}

export default HttpHandlerBuilder
