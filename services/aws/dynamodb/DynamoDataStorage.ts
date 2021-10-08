import { DynamoDB } from 'aws-sdk'

import { PrimaryKey, QueryBuilder, QueryParameters } from './utils'
import BaseDynamoDataStorage from './BaseDynamoDataStorage'
import DataStorage from './interfaces/DataStorage'

abstract class DynamoDataStorage<TEntity>
  extends BaseDynamoDataStorage<TEntity>
  implements DataStorage<TEntity>
{
  protected constructor(tableName: string) {
    super(tableName)
  }

  /**
   * Get an item using a combination of a hash key and range key, or just a hash key.
   * @template TEntity
   * @param { Partial<TEntity> } key - The primary key. May contain the hash key or range key, or just the hash key.
   * @returns {TEntity | null} The entity that was found or when no entity is found a null reference.
   * @template TEntity
   */
  public async get(key: PrimaryKey<TEntity>): Promise<TEntity | null> {
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
      batches.push(keys.splice(0, batchSize))
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
    const dynamoQuery: DynamoDB.DocumentClient.QueryInput = QueryBuilder.create(
      query,
      this.tableName,
      this.keys,
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
    )

    const results = await this.documentClient.query(dynamoQuery).promise()

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

  public async batchRemove(entities: Partial<TEntity>[]): Promise<void> {
    const keyPairs = (entities as TEntity[]).map(this.getKeyPairFromModel)

    const items: DynamoDB.DocumentClient.WriteRequests = keyPairs.map(
      (keyPair) => ({
        DeleteRequest: {
          Key: keyPair,
        },
      }),
    )

    await this.documentClient
      .batchWrite({
        RequestItems: {
          [this.tableName]: items,
        },
      })
      .promise()
  }

  public async batchSave(entities: TEntity[]): Promise<TEntity[]> {
    const items: DynamoDB.DocumentClient.WriteRequests = entities.map(
      (entity) => ({
        PutRequest: {
          Item: entity,
        },
      }),
    )

    await this.documentClient
      .batchWrite({
        RequestItems: {
          [this.tableName]: items,
        },
      })
      .promise()

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
