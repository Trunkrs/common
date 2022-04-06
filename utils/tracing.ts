/* eslint-disable @typescript-eslint/no-var-requires,global-require */
import XRay, { Subsegment, SegmentLike } from 'aws-xray-sdk'
import { MiddlewareLayer } from './handlers/HttpHandlerBuilder/types'

class SegmentStack {
  private readonly stack: Array<SegmentLike> = []

  public get current(): SegmentLike | undefined {
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

  public addSegment(name: string, parent?: SegmentLike): Subsegment {
    const subSeg = (parent ?? (this.current as SegmentLike))?.addNewSubsegment(
      name,
    )
    this.stack.push(subSeg)

    return subSeg
  }

  public closeSegment(error?: unknown): void {
    const segment = this.stack.pop()
    segment?.close(error as Error | undefined)
  }

  public tracePromise<TResult>(
    name: string,
    promise: Promise<TResult>,
    parent?: SegmentLike,
  ): Promise<TResult> {
    this.addSegment(name, parent)

    return promise
      .then((result) => {
        this.closeSegment()
        return result
      })
      .catch((error) => {
        this.closeSegment(error)
        throw error
      })
  }

  public traceAsyncFunction<TArgs extends any[], TResult = never>(
    methodName: string,
    fn: (...args: TArgs) => Promise<TResult>,
    parent?: SegmentLike,
  ): (...args: TArgs) => Promise<TResult> {
    return (...args: TArgs) => {
      return this.tracePromise(methodName, fn(...args), parent)
    }
  }

  public middleWare: MiddlewareLayer = () => {
    this.prepare()
  }
}

const Tracing = new SegmentStack()

export default Tracing
