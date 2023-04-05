export interface HttpRequestParams<TParams = unknown> {
  /**
   * The url of the resource to request.
   */
  url: string

  /**
   * The optional parameters to add to the request.
   */
  params?: TParams

  /**
   * Forces the parameters to go onto the BODY part and are not encoded on the url.
   * Usually only available on GET and DELETE requests.
   */
  forceParamsOnBody?: boolean

  /**
   * The optional headers to add to the request.
   */
  headers?: Record<string, any>

  /**
   * The response type of the request.
   * @default json
   */
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream'

  /**
   * An optional timeout in milliseconds.
   * @default 3000
   */
  timeout?: number

  /**
   * Facilitates web authentication using the specified username and password.
   */
  authentication?: {
    username: string
    password: string
  }
}

export interface HttpClient {
  /**
   * Executes a GET request based of the specified request details.
   * @param request The request details to execute the GET request.
   * @returns TResult
   * @throws HttpRequestError
   */
  get<TResult, TParams = unknown>(
    request: HttpRequestParams<TParams>,
  ): Promise<TResult>

  /**
   * Executes a POST request based of the specified request details.
   * @param request The request details to execute the POST request.
   * @returns TResult
   */
  post<TResult, TParams = unknown>(
    request: HttpRequestParams<TParams>,
  ): Promise<TResult>

  /**
   * Executes a PUT request based of the specified request details.
   * @param request The request details to execute the PUT request.
   * @returns TResult
   */
  put<TResult, TParams = unknown>(
    request: HttpRequestParams<TParams>,
  ): Promise<TResult>

  /**
   * Executes a DELETE request based of the specified request details.
   * @param request The request details to execute the DELETE request.
   */
  delete<TParams = unknown>(request: HttpRequestParams<TParams>): Promise<void>
}
