/* eslint-disable @typescript-eslint/no-var-requires,global-require */
import Axios, { AxiosError, AxiosInstance } from 'axios'
import { HttpRequestError } from '../../models/errors'

import { HttpClient, HttpRequestParams } from './HttpClient'

const defaultTimeout = 3000

class AxiosClient implements HttpClient {
  public readonly axiosClient: AxiosInstance

  public constructor() {
    this.axiosClient = Axios.create({
      httpAgent: new (require('http').Agent)(),
      httpsAgent: new (require('https').Agent)(),
    })
  }

  private static createError<TParams>(
    error: unknown,
    request: HttpRequestParams<TParams>,
  ): Error {
    const axiosError = error as AxiosError

    return new HttpRequestError(
      error,
      request,
      axiosError.response?.status,
      axiosError.response?.headers,
      axiosError.response?.data,
    )
  }

  public async get<TResult, TParams = unknown>(
    request: HttpRequestParams<TParams>,
  ): Promise<TResult> {
    try {
      const config = {
        auth: request.authentication,
        params: request.params && !request.forceParamsOnBody
          ? request.params
          : undefined,
        data: request.params && request.forceParamsOnBody
          ? request.params
          : undefined,
        headers: request.headers,
        timeout: request.timeout ?? defaultTimeout,
        responseType: request.responseType ?? 'json',
      }

      const response =
        await this.axiosClient.get<TResult>(request.url, config)

      return response.data
    } catch (error) {
      throw AxiosClient.createError(error, request)
    }
  }

  public async post<TResult, TParams = unknown>(
    request: HttpRequestParams<TParams>,
  ): Promise<TResult> {
    try {
      const response = await this.axiosClient.post<TParams>(
        request.url,
        request.params,
        {
          auth: request.authentication,
          headers: request.headers,
          timeout: request.timeout ?? defaultTimeout,
          responseType: request.responseType ?? 'json',
        },
      )

      return response.data as unknown as TResult
    } catch (error) {
      throw AxiosClient.createError(error, request)
    }
  }

  public async put<TResult, TParams = unknown>(
    request: HttpRequestParams<TParams>,
  ): Promise<TResult> {
    try {
      const response = await this.axiosClient.put<TParams>(
        request.url,
        request.params,
        {
          auth: request.authentication,
          headers: request.headers,
          timeout: request.timeout ?? defaultTimeout,
          responseType: request.responseType ?? 'json',
        },
      )

      return response.data as unknown as TResult
    } catch (error) {
      throw AxiosClient.createError(error, request)
    }
  }

  public async delete<TParams = unknown>(
    request: HttpRequestParams<TParams>,
  ): Promise<void> {
    try {
      const config = {
        auth: request.authentication,
        params: request.params && !request.forceParamsOnBody
          ? request.params
          : undefined,
        data: request.params && request.forceParamsOnBody
          ? request.params
          : undefined,
        headers: request.headers,
        timeout: request.timeout ?? defaultTimeout,
        responseType: request.responseType ?? 'json',
      }

      await this.axiosClient.delete(request.url, config)
    } catch (error) {
      throw AxiosClient.createError(error, request)
    }
  }
}

export default AxiosClient
