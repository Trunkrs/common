/* eslint-disable @typescript-eslint/no-var-requires,global-require */
import XRay, { Segment, Subsegment, SegmentLike } from 'aws-xray-sdk'
import XRayCore from 'aws-xray-sdk-core'
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'
import { MiddlewareLayer } from './handlers/HttpHandlerBuilder/types'

class Tracing {
  private static readonly stack: Array<SegmentLike> = []

  /**
   * Traces calls to this function in X-Ray.
   * @param className The class name of this function. Can't be found automatically sadly.
   * @param name An optional custom name other than the function name.
   */
  public static asyncMethod(className: string, name?: string): MethodDecorator {
    return (target, propertyName, descriptor) => {
      const actualName = name ?? String(propertyName)

      // eslint-disable-next-line @typescript-eslint/no-use-before-define,no-param-reassign
      descriptor.value = Tracing.traceAsyncFunction(
        `[${className}]: ${actualName}`,
        descriptor?.value as any,
      ) as any
    }
  }

  public static get current(): SegmentLike | undefined {
    if (!Tracing.stack.length) {
      return XRay.getSegment()
    }

    return Tracing.stack[Tracing.stack.length - 1]
  }

  public static prepare(defaultName?: string): void {
    try {
      XRay.setContextMissingStrategy('LOG_ERROR')

      if (defaultName) {
        XRayCore.middleware.setDefaultName(defaultName)
      }

      XRay.captureHTTPsGlobal(require('http'))
      XRay.captureHTTPsGlobal(require('https'))
      XRay.capturePromise()
    } catch (error) {
      console.warn(`[Tracing]: ${(error as Error).message}`)
    }
  }

  public static async hookRequestCycle(
    request: AWSLambda.APIGatewayProxyEventV2,
    actionExecutor: () => Promise<AWSLambda.APIGatewayProxyResultV2>,
  ): Promise<AWSLambda.APIGatewayProxyResultV2> {
    Tracing.prepare(
      `[${request.requestContext.http.method}]: ${request.requestContext.http.path}`,
    )

    const headers = {
      ...Object.keys(request.headers).reduce(
        (newHeaders, headerName) =>
          Object.assign(newHeaders, {
            [headerName.toLowerCase()]: request.headers[headerName],
          }),
        {} as IncomingHttpHeaders,
      ),
      host: request.requestContext.domainName,
    }
    const mimickedRequest = {
      headers,
      method: request.requestContext.http.method,
      url: request.rawPath,
      connection: {
        secure: true,
      },
    } as unknown as IncomingMessage
    console.info(
      '[Tracing]: Created mimicked request',
      JSON.stringify(mimickedRequest),
    )

    const tracingHeader = XRayCore.middleware.processHeaders({ headers })
    console.info('[Tracing]: Established xray header value', tracingHeader)

    const name = XRayCore.middleware.resolveName(headers.host)
    console.info('[Tracing]: Established handler name', name)

    const segment = new Segment(name, tracingHeader.root, tracingHeader.parent)
    console.info('[Tracing]: Created new segment', segment)

    const combinedRequest = {
      header: {},
      req: mimickedRequest,
    }

    XRayCore.middleware.resolveSampling(
      tracingHeader,
      segment,
      combinedRequest as unknown as ServerResponse,
    )

    console.info(
      '[Tracing]: Resolved sampling & created request data',
      new XRayCore.middleware.IncomingRequestData(mimickedRequest),
    )

    segment.addIncomingRequestData(
      new XRayCore.middleware.IncomingRequestData(mimickedRequest),
    )

    console.info('[Tracing]: Starting action execution.')

    try {
      const response =
        (await actionExecutor()) as AWSLambda.APIGatewayProxyStructuredResultV2

      console.info(
        '[Tracing]: Action execution done. Processing result',
        response,
      )

      if (response.statusCode === 429) {
        segment.addThrottleFlag()
      }
      const cause = XRayCore.utils.getCauseTypeFromHttpStatus(
        response.statusCode as number,
      )

      // Determine segment flags
      if (response.statusCode === 429) segment.addThrottleFlag()
      if (cause === 'error') segment.addErrorFlag()
      if (cause === 'fault') segment.addFaultFlag()

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Yes, this is part of the internal typings. Refer to IncomingRequestData.close
      segment.http.close(response)
      segment.close()

      console.info('[Tracing]: Segment processed successfully.')

      return {
        ...response,
        headers: {
          ...response.headers,
          ...combinedRequest.header,
        },
      }
    } catch (error) {
      segment.close(error as Error | string)
      throw error
    }
  }

  public static addSegment(name: string, parent?: SegmentLike): Subsegment {
    const subSeg = (
      parent ?? (Tracing.current as SegmentLike)
    )?.addNewSubsegment(name)
    Tracing.stack.push(subSeg)

    return subSeg
  }

  public static closeSegment(error?: unknown): void {
    const segment = Tracing.stack.pop()
    segment?.close(error as Error | undefined)
  }

  /**
   * Traces the promise completion as an X-Ray segment.
   * @param name The name of the traced segment.
   * @param promise The promise to wrap.
   * @param parent An optional parent segment.
   */
  public static tracePromise<TResult>(
    name: string,
    promise: Promise<TResult>,
    parent?: SegmentLike,
  ): Promise<TResult> {
    Tracing.addSegment(name, parent)

    return promise
      .then((result) => {
        Tracing.closeSegment()
        return result
      })
      .catch((error) => {
        Tracing.closeSegment(error)
        throw error
      })
  }

  /**
   * Wraps the method in X-Ray tracing segments.
   * @param methodName The method name.
   * @param fn The method to trace.
   * @param parent An optional parent segment.
   */
  public static traceAsyncFunction<TArgs extends any[], TResult = never>(
    methodName: string,
    fn: (...args: TArgs) => Promise<TResult>,
    parent?: SegmentLike,
  ): (...args: TArgs) => Promise<TResult> {
    return (...args: TArgs) =>
      XRay.captureAsyncFunc(methodName, (subsegment) => {
        return fn(...args)
          .then((result) => {
            subsegment?.close()
            return result
          })
          .catch((error) => {
            subsegment?.close(error)
            throw error
          })
      })
  }

  public static middleWare: MiddlewareLayer = () => {
    Tracing.prepare()
  }
}

export default Tracing
