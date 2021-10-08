import { DynamoDB } from 'aws-sdk'

import BaseDynamoDataStorage from './BaseDynamoDataStorage'
import { QueryBuilder, QueryParameters } from './utils'
import QueryableDataStorage from './interfaces/QueryableDataStorage'

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
    const dynamoQuery: DynamoDB.DocumentClient.QueryInput = QueryBuilder.create(
      query,
      this.tableName,
      this.keys,
      this.indexName,
    )

    const results = await this.documentClient.query(dynamoQuery).promise()

    return results.Items ? (results.Items as TResultEntity[]) : []
  }

  public async findOne(
    query: Omit<QueryParameters<TEntity>, 'limit'>,
  ): Promise<TEntity | null> {
    const limitedQuery = {
      ...query,
      limit: 1,
    }

    const dynamoQuery: DynamoDB.DocumentClient.QueryInput = QueryBuilder.create(
      limitedQuery,
      this.tableName,
      this.keys,
      this.indexName,
    )

    const results = await this.documentClient.query(dynamoQuery).promise()

    return results.Items ? (results.Items[0] as TEntity) : null
  }
}

export default DynamoIndexDataStorage
