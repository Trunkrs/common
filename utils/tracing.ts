/* eslint-disable @typescript-eslint/no-var-requires,global-require */
import XRay, { Subsegment, SegmentLike } from 'aws-xray-sdk'
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

  public static prepare(): void {
    try {
      XRay.setContextMissingStrategy('LOG_ERROR')

      XRay.captureHTTPsGlobal(require('http'))
      XRay.captureHTTPsGlobal(require('https'))
      XRay.capturePromise()
    } catch (error) {
      console.warn(`[Tracing]: ${(error as Error).message}`)
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
    return (...args: TArgs) => {
      return Tracing.tracePromise(methodName, fn(...args), parent)
    }
  }

  public static middleWare: MiddlewareLayer = () => {
    Tracing.prepare()
  }
}

export default Tracing
