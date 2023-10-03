import BaseDynamoDataStorage from './BaseDynamoDataStorage'
import { QueryBuilder, QueryParameters } from './utils'
import QueryableDataStorage from './interfaces/QueryableDataStorage'
import PaginatedFindResult from './interfaces/PaginatedFindResult'

type NewType<TResultEntity> = TResultEntity

abstract class DynamoIndexDataStorage<TEntity>
  extends BaseDynamoDataStorage<TEntity>
  implements QueryableDataStorage<TEntity>
{
  protected constructor(
    tableName: string,
    protected readonly indexName: string,
  ) {
    super(tableName)
  }

  public query<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
  ): Promise<TResultEntity[]> {
    const builderParams = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
      indexName: this.indexName,
    }

    const ddbQuery = QueryBuilder.buildQuery(builderParams)

    return this.executeQuery<TResultEntity>(ddbQuery)
  }

  public queryForPage<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
    lastEvaluatedKey?: string,
  ): Promise<PaginatedFindResult<TResultEntity>> {
    const builderParams = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
      indexName: this.indexName,
    }

    const ddbQuery = QueryBuilder.buildQuery(builderParams)

    return this.executePaginatedQuery<TResultEntity>(ddbQuery, lastEvaluatedKey)
  }

  public scan<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
  ): Promise<NewType<TResultEntity>[]> {
    const builderParams = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
      indexName: this.indexName,
    }

    const ddbQuery = QueryBuilder.buildScan(builderParams)

    return this.executeScan<TResultEntity>(ddbQuery)
  }

  public scanForPage<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
    lastEvaluatedKey?: string,
  ): Promise<PaginatedFindResult<TResultEntity>> {
    const builderParams = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
      indexName: this.indexName,
    }

    const ddbQuery = QueryBuilder.buildScan(builderParams)

    return this.executePaginatedScan<TResultEntity>(ddbQuery, lastEvaluatedKey)
  }

  public async findOne(
    query: Omit<QueryParameters<TEntity>, 'limit'>,
  ): Promise<TEntity | null> {
    const limitedQuery = {
      ...query,
      limit: 1,
    }

    const [result] = await this.query(limitedQuery)
    return result ?? null
  }
}

export default DynamoIndexDataStorage
