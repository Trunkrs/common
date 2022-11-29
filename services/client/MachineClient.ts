import { ResponseType } from 'axios'

import Cache from '../../utils/caching/Cache'

import { HttpClient } from './HttpClient'
import AxiosClient from './AxiosClient'
import MachineTokenClientBase from './MachineTokenClient/MachineTokenClientBase'

class MachineClient {
  protected bearerTokenPromise?: Promise<string>

  public constructor(
    protected readonly machineTokenClient: MachineTokenClientBase,
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
    const bearerToken = await this.getBearerToken()

    const data = await this.httpClient.get<TResponse>({
      url: this.createUrl(resource),
      headers: {
        ...headers,
        Authorization: `Bearer ${bearerToken}`,
      },
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
    const bearerToken = await this.getBearerToken()

    const data = await this.httpClient.post<TResponse, TRequest>({
      url: this.createUrl(resource),
      params: body,
      headers: {
        ...headers,
        Authorization: `Bearer ${bearerToken}`,
      },
    })

    return data
  }

  public async put<TRequest = any, TResponse = unknown>(
    resource: string,
    body: TRequest,
    headers?: Record<string, any>,
  ): Promise<TResponse> {
    const bearerToken = await this.getBearerToken()

    const data = await this.httpClient.put<TResponse, TRequest>({
      url: this.createUrl(resource),
      params: body,
      headers: {
        ...headers,
        Authorization: `Bearer ${bearerToken}`,
      },
    })

    return data
  }

  public async delete(
    resource: string,
    headers?: Record<string, any>,
  ): Promise<void> {
    const bearerToken = await this.getBearerToken()

    await this.httpClient.delete({
      url: this.createUrl(resource),
      headers: {
        ...headers,
        Authorization: `Bearer ${bearerToken}`,
      },
    })
  }

  protected async getBearerToken(): Promise<string> {
    if (this.bearerTokenPromise) {
      return this.bearerTokenPromise
    }

    this.bearerTokenPromise = this.cache.getOrAdd(this.secretCacheKey, () => {
      return this.machineTokenClient.getMachineToken()
    })

    const bearerToken = await this.bearerTokenPromise

    this.bearerTokenPromise = undefined

    return bearerToken
  }
}

export default MachineClient
