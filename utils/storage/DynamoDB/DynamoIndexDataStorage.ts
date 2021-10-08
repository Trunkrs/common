import { DynamoDB } from 'aws-sdk'

import QueryableDataStorage from '../interfaces/QueryableDataStorage'
import BaseDynamoDataStorage from './BaseDynamoDataStorage'
import { QueryBuilder, QueryParameters } from './utils'

abstract class DynamoIndexDataStorage<TEntity>
  extends BaseDynamoDataStorage<TEntity>
  implements QueryableDataStorage<TEntity>
{
  protected constructor(
    protected readonly documentClient: DynamoDB.DocumentClient,
    tableName: string,
    indexName: string,
    queryBuilder: typeof QueryBuilder,
  ) {
    super(tableName, queryBuilder, indexName)
  }

  public find(query: QueryParameters<TEntity>): Promise<TEntity[]> {
    return this.internalFind(this.documentClient, query)
  }

  public findOne(query: QueryParameters<TEntity>): Promise<TEntity | null> {
    return this.internalFindOne(this.documentClient, query)
  }
}

export default DynamoIndexDataStorage
