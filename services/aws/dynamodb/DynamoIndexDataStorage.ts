import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

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
    const operation = QueryBuilder.buildQuery(
      query,
      this.tableName,
      this.keys,
      this.indexName,
    )

    const results = []
    let lastEvaluatedKey

    do {
      // eslint-disable-next-line no-await-in-loop
      const page: DocumentClient.QueryOutput = await this.executeQueryOperation(
        operation,
        lastEvaluatedKey,
      )

      if (page.Items?.length) {
        results.push(...page.Items)
      }

      lastEvaluatedKey = page.LastEvaluatedKey
    } while (lastEvaluatedKey)

    return results as TResultEntity[]
  }

  public async findOne(
    query: Omit<QueryParameters<TEntity>, 'limit'>,
  ): Promise<TEntity | null> {
    const limitedQuery = {
      ...query,
      limit: 1,
    }

    const operation = QueryBuilder.buildQuery(
      limitedQuery,
      this.tableName,
      this.keys,
      this.indexName,
    )

    // eslint-disable-next-line no-await-in-loop
    const results: DocumentClient.QueryOutput =
      await this.executeQueryOperation(operation)
    return results.Items ? (results.Items[0] as TEntity) : null
  }
}

export default DynamoIndexDataStorage
