import { CoreServiceStack } from '../../models/enum'
import MachineClient from './MachineClient'
import { CoreServicesRequestFailedError } from '../../models/errors'

interface CoreServicesQueryInput {
  query: string
  params?: Array<string | number>
}

interface CoreServicesQueryOutput<TReturn> {
  result?: TReturn
  message?: string
  stackTrace?: string
}

class CoreServicesMachineClient extends MachineClient {
  /**
   * Runs an SQL query against the CoreServices postgres database.
   * Use $1 to note a parameter and add that to the parameters array if the query needs formatting.
   * @param {CoreServiceStack} service The "microservice" stack the query should be ran against.
   * @param {string} query The SQL query to run
   * @param {Array<string | number>>} params an optional array of strings and numbers to be formatted into the query.
   * @protected
   */
  public async runQuery<TReturn>(
    service: CoreServiceStack,
    query: string,
    params?: Array<string | number>,
  ): Promise<TReturn> {
    const bearerToken = await this.getBearerToken()

    const response = await this.httpClient.put<
      CoreServicesQueryOutput<TReturn>,
      CoreServicesQueryInput
    >({
      url: this.createUrl(`/${service}/private/query`),
      params: {
        query,
        params,
      },
      timeout: 30000,
      headers: {
        Authorization: `bearer ${bearerToken}`,
      },
    })

    if (!response.result) {
      throw new CoreServicesRequestFailedError(
        response.stackTrace ||
          'no stacktrace received, it is likely there was no result',
        response.message ||
          'no message received, it is likely there was no result',
      )
    }

    return response.result
  }
}

export default CoreServicesMachineClient
