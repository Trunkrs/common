/* eslint-disable @typescript-eslint/no-var-requires,global-require */
import XRay, { Segment, Subsegment } from 'aws-xray-sdk'
import { MiddlewareLayer } from './handlers/HttpHandlerBuilder/types'

class SegmentStack {
  private readonly stack: Array<Segment | Subsegment> = []

  public get current(): Segment | Subsegment | undefined {
    if (!this.stack.length) {
      return XRay.getSegment()
    }

    return this.stack[this.stack.length - 1]
  }

  public prepare(): void {
    try {
      XRay.setContextMissingStrategy('LOG_ERROR')

      XRay.captureHTTPsGlobal(require('http'))
      XRay.captureHTTPsGlobal(require('https'))
      XRay.capturePromise()
    } catch (error) {
      console.warn(`[Tracing]: ${(error as Error).message}`)
    }
  }

  public addSegment(segment: Segment | Subsegment): void {
    this.stack.push(segment)
  }

  public closeSegment(error?: unknown): void {
    const segment = this.stack.pop()
    segment?.close(error as Error | undefined)
  }

  public tracePromise<TResult>(
    name: string,
    promise: Promise<TResult>,
    parent?: Segment | Subsegment,
  ): Promise<TResult> {
    return XRay.captureAsyncFunc(
      name,
      (segment) => {
        if (segment) this.addSegment(segment)

        return promise
          .then((result) => {
            this.closeSegment()
            return result
          })
          .catch((error) => {
            this.closeSegment(error)
            throw error
          })
      },
      parent ?? this.current,
    )
  }

  public traceAsyncFunction<TArgs extends any[], TResult = never>(
    methodName: string,
    fn: (...args: TArgs) => Promise<TResult>,
    parent?: Segment | Subsegment,
  ): (...args: TArgs) => Promise<TResult> {
    return (...args: TArgs) => {
      return this.tracePromise(methodName, fn(...args), parent ?? this.current)
    }
  }

  public middleWare: MiddlewareLayer = () => {
    this.prepare()
  }
}

const Tracing = new SegmentStack()

export default Tracing
