import { CoreServiceStack } from '../../models/enum'
import MachineClient from './MachineClient'

interface CoreServicesQueryInput {
  query: string
  params?: Array<string | number>
}

interface CoreServicesQueryOutput<TReturn> {
  result: TReturn
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
    const { result } = await this.put<
      CoreServicesQueryInput,
      CoreServicesQueryOutput<TReturn>
    >(`/${service}/private/query`, {
      query,
      params,
    })

    return result
  }
}

export default CoreServicesMachineClient
