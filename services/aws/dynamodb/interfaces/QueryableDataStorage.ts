import { QueryParameters } from '../utils'

interface QueryableDataStorage<TEntity> {
  /**
   * Finds several items for you through the specified where parameters.
   * Performs a query action in DynamoDB
   * @template TEntity
   * @param {QueryParameters<TEntity>} query
   * @returns {TEntity[]} an array of TEntity
   */
  find(query: QueryParameters<TEntity>): Promise<TEntity[]>

  /**
   * Finds a single item for you through the specified where parameters.
   * Performs a query action in DynamoDB
   * @template TEntity
   * @param {QueryParameters<TEntity>} query
   * @returns {TEntity | null} The entity or null.
   */
  findOne(query: QueryParameters<TEntity>): Promise<TEntity | null>
}

export default QueryableDataStorage
