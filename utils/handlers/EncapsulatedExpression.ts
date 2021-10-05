import { ExpressionFailedError } from '../../models/errors/handlers'

type InvokableTarget<TResult> = (...params: any[]) => TResult

// eslint-disable-next-line @typescript-eslint/ban-types
class EncapsulatedExpression<TActual = {}> {
  // Weird typing for proxies... ¯\_(ツ)_/¯
  #proxy?: unknown

  #callChain: Array<keyof TActual> = []

  public get?(target: TActual, property: string | symbol): any {
    this.#callChain.push(String(property) as keyof TActual)
    return this.asCapturable()
  }

  /**
   * Returns this expression as TActual, ready to capture an the expression tree.
   */
  public asCapturable(): TActual {
    if (!this.#proxy) {
      this.#proxy = new Proxy({}, this)
    }

    return this.#proxy as TActual
  }

  /**
   * Invokes the captured expression on
   * @param target The target to invoke on.
   * @param params The parameters for the invocation.
   * @returns The result of the executed expression.
   */
  public invoke<TResult = unknown>(target: TActual, ...params: any[]): TResult {
    let currentTarget: unknown
    let invokable: InvokableTarget<TResult> | undefined

    try {
      for (
        let callChainIdx = 0;
        callChainIdx < this.#callChain.length;
        callChainIdx += 1
      ) {
        const { [callChainIdx]: propKey } = this.#callChain
        const { [propKey]: newInvokable } = invokable ?? target

        currentTarget = invokable ?? target
        invokable = newInvokable as InvokableTarget<TResult>
      }
    } catch {
      throw new ExpressionFailedError()
    }

    const isInvalidInvocation =
      !currentTarget || !invokable || typeof invokable !== 'function'
    if (isInvalidInvocation) {
      throw new ExpressionFailedError()
    }

    return invokable?.apply(currentTarget, params) as TResult
  }

  /**
   * The stringified version of the expression.
   */
  public toString(): string {
    return this.#callChain.join('.')
  }
}

export default EncapsulatedExpression
