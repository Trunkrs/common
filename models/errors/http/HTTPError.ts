import ErrorBase from '../ErrorBase'

class HTTPError extends ErrorBase {
  public constructor(public readonly statusCode: number) {
    super()
  }

  // eslint-disable-next-line class-methods-use-this
  public getBody(): Record<string, any> | null {
    return null
  }
}

export default HTTPError
