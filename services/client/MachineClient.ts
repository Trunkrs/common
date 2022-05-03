import { AxiosError, AxiosResponse, ResponseType } from 'axios'

import Cache from '../../utils/caching/Cache'

import { HttpClient } from './HttpClient'
import AxiosClient from './AxiosClient'
import MachineTokenClient from './MachineTokenClient'

class MachineClient {
  private static readonly maxRetryDepth = 2

  protected bearerTokenInterceptorId?: number

  private tokenResponseInterceptorId?: number

  public constructor(
    protected readonly machineTokenClient: MachineTokenClient,
    protected readonly httpClient: HttpClient,
    protected readonly cache: Cache,
    protected readonly secretCacheKey: string,
    protected readonly baseUrl: string,
  ) {}

  protected createUrl(resource: string): string {
    return resource.startsWith('/')
      ? `${this.baseUrl}${resource}`
      : `${this.baseUrl}/${resource}`
  }

  protected get axiosClient() {
    const client = this.httpClient as AxiosClient
    return client?.axiosClient
  }

  public async get<TResponse, TRequest = any>(
    resource: string,
    parameters?: TRequest,
    headers?: Record<string, any>,
    responseType?: ResponseType,
  ): Promise<TResponse> {
    await this.checkBearerToken()
    const data = await this.httpClient.get<TResponse>({
      url: this.createUrl(resource),
      headers,
      params: parameters,
      responseType,
    })

    return data
  }

  public async post<TRequest = any, TResponse = unknown>(
    resource: string,
    body: TRequest,
    headers?: Record<string, any>,
  ): Promise<TResponse> {
    await this.checkBearerToken()
    const data = await this.httpClient.post<TResponse, TRequest>({
      url: this.createUrl(resource),
      params: body,
      headers,
    })

    return data
  }

  public async put<TRequest = any, TResponse = unknown>(
    resource: string,
    body: TRequest,
    headers?: Record<string, any>,
  ): Promise<TResponse> {
    await this.checkBearerToken()
    const data = await this.httpClient.put<TResponse, TRequest>({
      url: this.createUrl(resource),
      params: body,
      headers,
    })

    return data
  }

  public async delete(
    resource: string,
    headers?: Record<string, any>,
  ): Promise<void> {
    await this.checkBearerToken()
    await this.httpClient.delete({
      url: this.createUrl(resource),
      headers,
    })
  }

  protected async getBearerToken(): Promise<string> {
    const token = await this.cache.getOrAdd(this.secretCacheKey, () => {
      return this.machineTokenClient.getMachineToken()
    })

    return token
  }

  protected async checkBearerToken(): Promise<void> {
    const token = await this.getBearerToken()

    if (this.bearerTokenInterceptorId && this.tokenResponseInterceptorId) {
      this.axiosClient.interceptors.request.eject(this.bearerTokenInterceptorId)
      this.axiosClient.interceptors.response.eject(
        this.tokenResponseInterceptorId,
      )
    }

    this.bearerTokenInterceptorId = this.axiosClient.interceptors.request.use(
      (config) => {
        const modifiedHeaders = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }

        return Object.assign(config, { headers: modifiedHeaders })
      },
    )
    this.tokenResponseInterceptorId =
      this.axiosClient.interceptors.response.use(
        (response) => response,
        async (axiosError: AxiosError): Promise<AxiosResponse> => {
          if (axiosError.response?.status !== 401) {
            throw axiosError
          }

          const retryDepth: number = (axiosError.config as any).retryDepth ?? 0
          if (retryDepth >= MachineClient.maxRetryDepth) {
            return Promise.reject(axiosError)
          }

          Object.assign(axiosError.config, {
            retryDepth: retryDepth + 1,
          })

          await this.cache.remove(this.secretCacheKey)
          await this.checkBearerToken()

          return this.axiosClient.request(axiosError.config)
        },
      )
  }
}

export default MachineClient
