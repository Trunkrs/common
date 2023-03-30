import BaseDynamoDataStorage from './BaseDynamoDataStorage'
import { QueryBuilder, QueryParameters } from './utils'
import QueryableDataStorage from './interfaces/QueryableDataStorage'
import PaginatedFindResult from './interfaces/PaginatedFindResult'

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

  public async find<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
  ): Promise<TResultEntity[]> {
    const queryOp = query.queryOptions?.operation ?? 'Query'
    const builderParams = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
      indexName: this.indexName,
    }

    const ddbQuery =
      queryOp === 'Scan'
        ? QueryBuilder.buildScan(builderParams)
        : QueryBuilder.buildQuery(builderParams)

    const result = await this.executeOperation<TResultEntity>(queryOp, ddbQuery)
    return result
  }

  public async paginatedFind<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
    lastEvaluatedKey?: string
  ): Promise<PaginatedFindResult<TResultEntity>> {
    const queryOp = query.queryOptions?.operation ?? 'Query'
    const builderParams  = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
      indexName: this.indexName,
    }

    const ddbQuery = queryOp === 'Scan'
      ? QueryBuilder.buildScan(builderParams)
      : QueryBuilder.buildQuery(builderParams)

    const result = await this.executePaginatedOperation<TResultEntity>(
      queryOp,
      ddbQuery,
      lastEvaluatedKey
    )

    return result
  }

  public async findOne(
    query: Omit<QueryParameters<TEntity>, 'limit'>,
  ): Promise<TEntity | null> {
    const limitedQuery = {
      ...query,
      limit: 1,
    }

    const [result] = await this.find(limitedQuery)
    return result ?? null
  }
}

export default DynamoIndexDataStorage
