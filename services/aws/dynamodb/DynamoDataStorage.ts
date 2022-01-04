/* eslint-disable prettier/prettier */
import { DynamoDB } from 'aws-sdk'

import { BatchWriteItemRequestMap } from 'aws-sdk/clients/dynamodb'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

import { PrimaryKey, QueryBuilder, QueryParameters } from './utils'
import BaseDynamoDataStorage from './BaseDynamoDataStorage'
import DataStorage from './interfaces/DataStorage'
import BatchSizeTooBigError from './BatchSizeTooBigError'

abstract class DynamoDataStorage<TEntity>
  extends BaseDynamoDataStorage<TEntity>
  implements DataStorage<TEntity>
{
  protected constructor(tableName: string) {
    super(tableName)
  }

  protected async batchWriteRequest(
    writeRequests: DynamoDB.DocumentClient.WriteRequests,
    batchSize = 24,
  ): Promise<void> {
    if (batchSize > 24) {
      throw new BatchSizeTooBigError()
    }

    const batches = []
    while (writeRequests.length) {
      batches.push(
        writeRequests.splice(0, batchSize).filter((element) => element),
      )
    }

    await Promise.all(
      batches.map(async (batch: DynamoDB.DocumentClient.WriteRequest[]) => {
        let requestItems: BatchWriteItemRequestMap | undefined = {
          [this.tableName]: batch,
        }

        do {
          const result: DynamoDB.DocumentClient.BatchWriteItemOutput =
            // eslint-disable-next-line no-await-in-loop
            await this.documentClient
              .batchWrite({
                RequestItems: requestItems,
              })
              .promise()

          requestItems = result.UnprocessedItems
        } while (requestItems && Object.keys(requestItems).length > 0)
      }),
    )
  }

  /**
   * Get an item using a combination of a hash key and range key, or just a hash key.
   * @template TEntity
   * @param { Partial<TEntity> } key - The primary key. May contain the hash key or range key, or just the hash key.
   * @returns {TEntity | null} The entity that was found or when no entity is found a null reference.
   * @template TEntity
   */
  public async get(
    key: PrimaryKey<TEntity>,
  ): Promise<TEntity | null> {
    const dynamoGetRequest: DynamoDB.DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: key,
    }
    const result = await this.documentClient.get(dynamoGetRequest).promise()

    return result.Item ? (result.Item as TEntity) : null
  }

  /**
   * Gets multiple items using a combination of a hash key and range key, or just a hash key.
   * @template TEntity
   * @param {PrimaryKey<TEntity>[]} keys The combination of primary/composed keys to be used to perform the multiple get operations with.
   * @param {number} batchSize The amount of get requests in a single batch. Cannot be more than 100 or more than 16MB in size.
   * @returns {TEntity | null} The entity that was found or when no entity is found a null reference.
   */
  public async batchGet(
    keys: PrimaryKey<TEntity>[],
    batchSize = 100,
  ): Promise<TEntity[]> {
    const batches = []
    while (keys.length) {
      batches.push(keys.splice(0, batchSize).filter((key) => key))
    }

    const batchResults = await Promise.all(
      batches.map(async (batch) => {
        const dynamoBatchGetRequest: DynamoDB.DocumentClient.BatchGetItemInput =
          {
            RequestItems: {
              [this.tableName]: { Keys: batch },
            },
          }

        const results = await this.documentClient
          .batchGet(dynamoBatchGetRequest)
          .promise()

        return (
          ((results.Responses &&
            results.Responses[this.tableName]) as TEntity[]) || []
        )
      }),
    )

    return batchResults.reduce((results, batch) => {
      results.push(...batch)

      return results
    }, [])
  }

  public async find<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
  ): Promise<TResultEntity[]> {
    const operation = QueryBuilder.buildQuery(query, this.tableName, this.keys, query.queryOptions?.operation)

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
      query.queryOptions?.operation,
    )

    // eslint-disable-next-line no-await-in-loop
    const results: DocumentClient.QueryOutput =
      await this.executeQueryOperation(operation)
    return results.Items ? (results.Items[0] as TEntity) : null
  }

  public async remove(entity: Partial<TEntity>): Promise<void> {
    const keyPair = this.getKeyPairFromModel(entity as TEntity)

    await this.documentClient
      .delete({
        TableName: this.tableName,
        Key: keyPair,
      })
      .promise()
  }

  public async batchRemove(
    entities: Partial<TEntity>[],
    batchSize = 24,
  ): Promise<void> {
    const keyPairs = (entities as TEntity[]).map(this.getKeyPairFromModel)

    const items: DynamoDB.DocumentClient.WriteRequests = keyPairs.map(
      (keyPair) => ({
        DeleteRequest: {
          Key: keyPair,
        },
      }),
    )

    await this.batchWriteRequest(items, batchSize)
  }

  public async batchSave(
    entities: TEntity[],
    batchSize = 24,
  ): Promise<TEntity[]> {
    const items: DynamoDB.DocumentClient.WriteRequests = entities.map(
      (entity) => ({
        PutRequest: {
          Item: entity,
        },
      }),
    )

    await this.batchWriteRequest(items, batchSize)

    return entities
  }

  public async save(entity: TEntity): Promise<TEntity> {
    await this.documentClient
      .put({
        TableName: this.tableName,
        Item: entity,
      })
      .promise()

    return entity
  }
}

export default DynamoDataStorage
