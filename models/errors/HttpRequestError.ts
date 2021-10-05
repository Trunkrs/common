import ErrorBase from './ErrorBase'
import { HttpRequestParams } from '../../services/client/HttpClient'

class HttpRequestError extends ErrorBase {
  public constructor(
    /**
     * The inner error of the client.
     */
    public readonly innerError: unknown,
    /**
     * The request details that yielded the reponse.
     */
    public readonly request: HttpRequestParams,
    /**
     * The status code of the response.
     */
    public readonly statusCode?: number,
    /**
     * The response headers.
     */
    public readonly headers?: Record<string, any>,
    /**
     * The response data.
     */
    public readonly responseData?: any,
  ) {
    super()

    this.message = `The request failed with status code: ${statusCode}`
  }
}

export default HttpRequestError
