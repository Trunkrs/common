import { QueryParameters } from '../utils'
import PaginatedFindResult from './PaginatedFindResult'

interface QueryableDataStorage<TEntity> {
  /**
   * Uses a DynamoDB Query Operation to find all items matching a specified query.
   * https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
   * @template TEntity
   * @param {QueryParameters<TEntity>} query
   * @returns {Promise<TEntity[]>}
   */
  query(query: QueryParameters<TEntity>): Promise<TEntity[]>

  /**
   * Uses a DynamoDB Query Operation to find items matching a specified query.
   * Returns a single page of items. Page Size is determined by DynamoDB.
   * https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
   * @template TEntity
   * @param {QueryParameters<TEntity>} query the query which will find mathcing items
   * @param {string} lastEvaluatedKey the last key evaluated by dynamodb
   * @returns {Promise<TEntity[]>}
   */
  queryForPage(
    query: QueryParameters<TEntity>,
    lastEvaluatedKey?: string,
  ): Promise<PaginatedFindResult<TEntity>>

  /**
   * Uses a DynamoDB Scan Operation to find all items matching a specified query.
   * https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
   * @template TEntity
   * @param {QueryParameters<TEntity>} query
   * @returns {Promise<TEntity[]>}
   */
  scan(query: QueryParameters<TEntity>): Promise<TEntity[]>

  /**
   * Uses a DynamoDB Scan Operation to find items matching a specified query.
   * Returns a single page of items. Page Size is determined by DynamoDB.
   * https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
   * @template TEntity
   * @param {QueryParameters<TEntity>} query the query which will find mathcing items
   * @param {string} lastEvaluatedKey the last key evaluated by dynamodb
   * @returns {Promise<TEntity[]>}
   */
  scanForPage(
    query: QueryParameters<TEntity>,
    lastEvaluatedKey?: string,
  ): Promise<PaginatedFindResult<TEntity>>

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
