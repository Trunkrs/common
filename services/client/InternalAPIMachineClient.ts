import MachineClient from './MachineClient'
import MachineTokenClient from './MachineTokenClient'
import { HttpClient } from './HttpClient'
import Cache from '../../utils/caching/Cache'
import InternalAPIQueryStringSerializer from '../../utils/serialization/InternalAPIQueryStringSerializer'

class InternalAPIMachineClient extends MachineClient {
  public constructor(
    protected readonly machineTokenClient: MachineTokenClient,
    protected readonly httpClient: HttpClient,
    protected readonly cache: Cache,
    protected readonly secretCacheKey: string,
    protected readonly baseUrl: string,
    protected readonly internalAPISerializer: InternalAPIQueryStringSerializer,
  ) {
    super(machineTokenClient, httpClient, cache, secretCacheKey, baseUrl)
  }

  public async get<TResponse, TRequest>(
    resource: string,
    parameters?: TRequest,
    headers?: Record<string, any>,
  ): Promise<TResponse> {
    const bearerToken = await this.getBearerToken()

    const { data } = await this.axiosClient.get<TResponse>(
      this.createUrl(resource),
      {
        headers: {
          ...headers,
          Authorization: `Bearer ${bearerToken}`,
        },
        params: parameters,
        paramsSerializer: (toBeSerialized) =>
          this.internalAPISerializer.serialize(toBeSerialized, 'string'),
      },
    )

    return data
  }

  public async delete<TResponse, TRequest>(
    resource: string,
    parameters?: TRequest,
    headers?: Record<string, any>,
  ): Promise<TResponse> {
    const bearerToken = await this.getBearerToken()

    const { data } = await this.axiosClient.delete<TResponse>(
      this.createUrl(resource),
      {
        headers: {
          ...headers,
          Authorization: `Bearer ${bearerToken}`,
        },
        params: parameters,
        paramsSerializer: (toBeSerialized) =>
          this.internalAPISerializer.serialize(toBeSerialized, 'string'),
      },
    )

    return data
  }
}

export default InternalAPIMachineClient
