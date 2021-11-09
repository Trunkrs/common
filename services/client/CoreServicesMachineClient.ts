import { CoreServiceStack } from '../../models/enum'
import MachineClient from './MachineClient'

class CoreServicesMachineClient extends MachineClient {
  /**
   * Runs an SQL query against the CoreServices postgres database.
   * Use $1 to note a parameter and add that to the parameters array if the query needs formatting.
   * @param {CoreServiceStack} service The "microservice" stack the query should be ran against.
   * @param {string} query The SQL query to run
   * @param {Array<string | number>>} params an optional array of strings and numbers to be formatted into the query.
   * @protected
   */
  protected async runQuery<TReturn>(
    service: CoreServiceStack,
    query: string,
    params?: Array<string | number>,
  ): Promise<TReturn> {
    const { result } = await this.httpClient.put({
      url: `/${service}/private/query`,
      params: {
        query,
        params,
      },
    })

    return result
  }
}

export default CoreServicesMachineClient
