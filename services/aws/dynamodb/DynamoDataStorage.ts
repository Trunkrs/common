import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  BatchGetCommandInput,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb'

import { PrimaryKey, QueryBuilder, QueryParameters } from './utils'
import BaseDynamoDataStorage from './BaseDynamoDataStorage'
import DataStorage from './interfaces/DataStorage'
import BatchSizeTooBigError from './BatchSizeTooBigError'
import PaginatedFindResult from './interfaces/PaginatedFindResult'
import WriteRequest from './types/WriteRequest'

abstract class DynamoDataStorage<TEntity>
  extends BaseDynamoDataStorage<TEntity>
  implements DataStorage<TEntity>
{
  protected constructor(tableName: string) {
    super(tableName)
  }

  protected async batchWriteRequest(
    writeRequests: WriteRequest[],
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

    for (let i = 0; i < batches.length; i += 1) {
      const batch = batches[i]

      let requestItems: BatchWriteCommandInput['RequestItems'] = {
        [this.tableName]: batch,
      }

      do {
        const command = new BatchWriteCommand({ RequestItems: requestItems })

        // eslint-disable-next-line no-await-in-loop
        const result: BatchWriteCommandOutput = await this.documentClient.send(
          command,
        )

        requestItems = result.UnprocessedItems
      } while (requestItems && Object.keys(requestItems).length > 0)
    }
  }

  /**
   * Get an item using a combination of a hash key and range key, or just a hash key.
   * @template TEntity
   * @param { Partial<TEntity> } key - The primary key. May contain the hash key or range key, or just the hash key.
   * @returns {TEntity | null} The entity that was found or when no entity is found a null reference.
   * @template TEntity
   */
  public async get(key: PrimaryKey<TEntity>): Promise<TEntity | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: key,
    })

    const result = await this.documentClient.send(command)

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
        const command = new BatchGetCommand({
          RequestItems: {
            [this.tableName]: { Keys: batch },
          },
        })

        const results = await this.documentClient.send(command)

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

  public async query<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
  ): Promise<TResultEntity[]> {
    const builderParams = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
    }

    const ddbQuery = QueryBuilder.buildQuery(builderParams)

    const result = await this.executeQuery<TResultEntity>(ddbQuery)
    return result
  }

  public async scan<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
  ): Promise<TResultEntity[]> {
    const builderParams = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
    }

    const ddbQuery = QueryBuilder.buildScan(builderParams)

    const result = await this.executeScan<TResultEntity>(ddbQuery)
    return result
  }

  public async queryPaginated<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
    lastEvaluatedKey?: string,
  ): Promise<PaginatedFindResult<TResultEntity>> {
    const builderParams = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
    }

    const ddbQuery = QueryBuilder.buildQuery(builderParams)
    const result = await this.executePaginatedQuery<TResultEntity>(
      ddbQuery,
      lastEvaluatedKey,
    )

    return result
  }

  public async scanPaginated<TResultEntity = TEntity>(
    query: QueryParameters<TEntity>,
    lastEvaluatedKey?: string,
  ): Promise<PaginatedFindResult<TResultEntity>> {
    const builderParams = {
      query,
      tableName: this.tableName,
      primaryKeys: this.keys,
    }

    const ddbQuery = QueryBuilder.buildScan(builderParams)
    const result = await this.executePaginatedScan<TResultEntity>(
      ddbQuery,
      lastEvaluatedKey,
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

    const [result] = await this.query(limitedQuery)
    return result ?? null
  }

  public async remove(entity: Partial<TEntity>): Promise<void> {
    const keyPair = this.getKeyPairFromModel(entity as TEntity)

    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: keyPair,
    })

    await this.documentClient.send(command)
  }

  public async batchRemove(
    entities: Partial<TEntity>[],
    batchSize = 24,
  ): Promise<void> {
    const keyPairs = (entities as TEntity[]).map((entity) =>
      this.getKeyPairFromModel(entity),
    )

    const items: WriteRequest[] = keyPairs.map((keyPair) => ({
      DeleteRequest: {
        Key: keyPair,
      },
    }))

    await this.batchWriteRequest(items, batchSize)
  }

  public async batchSave(
    entities: TEntity[],
    batchSize = 24,
  ): Promise<TEntity[]> {
    const items: WriteRequest[] = entities.map((entity) => ({
      PutRequest: {
        Item: entity,
      },
    }))

    await this.batchWriteRequest(items, batchSize)

    return entities
  }

  public async save(entity: TEntity): Promise<TEntity> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: entity,
    })

    await this.documentClient.send(command)

    return entity
  }
}

export default DynamoDataStorage
