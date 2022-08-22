import * as Joi from 'joi'

export type MiddlewareLayer<TContext = any, TResultContext = any> = (
  event: AWSLambda.APIGatewayProxyEventV2,
  currentContext: TContext,
) => Promise<TResultContext> | TResultContext

export type HTTPLambdaHandler = (
  event: AWSLambda.APIGatewayProxyEventV2,
) => Promise<AWSLambda.APIGatewayProxyResultV2>

export interface HTTPReply {
  statusCode: number
  body?: string
}

export interface HTTPResult<TBody = unknown> {
  statusCode: number
  body?: TBody
  headers?: { [key: string]: string }
}

export interface HTTPEvent<TContext = unknown, TInput = unknown> {
  headers: NodeJS.Dict<string>
  params: NodeJS.Dict<string>
  input: TInput
  url: string
  context: TContext
}

export type SchemaFactory<TContext = unknown, TSchema = unknown> = (
  context: TContext,
) => Joi.ObjectSchema<TSchema>
