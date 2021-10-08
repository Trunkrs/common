import { DynamoDB } from 'aws-sdk'

import { PrimaryKey, QueryBuilder, QueryParameters } from './utils'

abstract class BaseDynamoDataStorage<TEntity> {
  protected abstract readonly keys: Array<keyof TEntity>

  protected constructor(
    protected readonly tableName: string,
    protected readonly queryBuilder: typeof QueryBuilder,
    /**
     * Used in case of readOnlyData storage. Uses a specific index on a DynamoTable to query instead of the main table.
     */
    protected readonly indexName?: string,
  ) {}

  protected getKeyPairFromModel(model: TEntity): Partial<TEntity> {
    const keyDictionary: Partial<TEntity> = {}

    this.keys.forEach((key) => {
      keyDictionary[key] = model[key]
    })

    return keyDictionary
  }

  /**
   * Get an item using a combination of a hash key and range key, or just a hash key.
   * @template TEntity
   * @param {DynamoDB.DocumentClient} documentClient The default documentClient or a documentClient instantiated through the AWS DAX service.
   * @param { Partial<TEntity> } key - The primary key. May contain the hash key or range key, or just the hash key.
   * @returns {TEntity | null} The entity that was found or when no entity is found a null reference.
   * @template TEntity
   */
  protected async internalGet(
    documentClient: DynamoDB.DocumentClient,
    key: PrimaryKey<TEntity>,
  ): Promise<TEntity | null> {
    const dynamoGetRequest: DynamoDB.DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: key,
    }
    const result = await documentClient.get(dynamoGetRequest).promise()

    return result.Item ? (result.Item as TEntity) : null
  }

  /**
   * Gets multiple items using a combination of a hash key and range key, or just a hash key.
   * @template TEntity
   * @param {DynamoDB.DocumentClient} documentClient The default documentClient or a documentClient instantiated through the AWS DAX service.
   * @param {PrimaryKey<TEntity>[]} keys The combination of primary/composed keys to be used to perform the multiple get operations with.
   * @returns {TEntity | null} The entity that was found or when no entity is found a null reference.
   * @template TEntity
   */
  protected async internalBatchGet(
    documentClient: DynamoDB.DocumentClient,
    keys: PrimaryKey<TEntity>[],
  ): Promise<TEntity[]> {
    const batches = []
    while (keys.length) {
      batches.push(keys.splice(0, 15))
    }

    const batchResults = await Promise.all(
      batches.map(async (batch) => {
        const dynamoBatchGetRequest: DynamoDB.DocumentClient.BatchGetItemInput =
          {
            RequestItems: {
              [this.tableName]: { Keys: batch },
            },
          }

        const results = await documentClient
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

  /**
   * Finds several items for you through the specified where parameters.
   * Make sure to apply the partitionKey and potential sortKey for your table.
   * @template TEntity
   * @param {DynamoDB.DocumentClient} documentClient The default documentClient or a documentClient instantiated through the AWS DAX service.
   * @param query
   */
  protected async internalFind<TResultEntity = TEntity>(
    documentClient: DynamoDB.DocumentClient,
    query: QueryParameters<TEntity>,
  ): Promise<TResultEntity[]> {
    const dynamoQuery: DynamoDB.DocumentClient.QueryInput = this.queryBuilder(
      query,
      this.tableName,
      this.keys,
    )

    const results = await documentClient.query(dynamoQuery).promise()

    return results.Items ? (results.Items as TResultEntity[]) : []
  }

  /**
   * Finds one specific entity for you. Make sure to include the partKey and potential
   * sortKey for your specific table.
   * @template TEntity
   * @param {DynamoDB.DocumentClient} documentClient The default documentClient or a documentClient instantiated through the AWS DAX service.
   * @param query
   */
  protected async internalFindOne(
    documentClient: DynamoDB.DocumentClient,
    query: Omit<QueryParameters<TEntity>, 'limit'>,
  ): Promise<TEntity | null> {
    const limitedQuery = {
      ...query,
      limit: 1,
    }

    const dynamoQuery: DynamoDB.DocumentClient.QueryInput = this.queryBuilder(
      limitedQuery,
      this.tableName,
      this.keys,
    )

    const results = await documentClient.query(dynamoQuery).promise()

    return results.Items ? (results.Items[0] as TEntity) : null
  }

  /**
   * Deletes the given entity from the database.
   * Make sure to provide at least the necessary keypair according to your data model.
   * @template TEntity
   * @param {DynamoDB.DocumentClient} documentClient The default documentClient or a documentClient instantiated through the AWS DAX service.
   * @param { TEntity } entity
   * @returns {Promise<void>}
   */
  protected async internalRemove(
    documentClient: DynamoDB.DocumentClient,
    entity: Partial<TEntity>,
  ): Promise<void> {
    const keyPair = this.getKeyPairFromModel(entity as TEntity)

    await documentClient
      .delete({
        TableName: this.tableName,
        Key: keyPair,
      })
      .promise()
  }

  /**
   * Delete multiple entities from the database in one go.
   * @template TEntity
   * @param {DynamoDB.DocumentClient} documentClient The default documentClient or a documentClient instantiated through the AWS DAX service.
   * @param {Array<TEntity>} entities The entities that are to be removed. Make sure each entity contains at least their respective primary/composed keys.
   * @returns {Promise<void>}
   */
  protected async internalBatchRemove(
    documentClient: DynamoDB.DocumentClient,
    entities: Partial<TEntity>[],
  ): Promise<void> {
    const keyPairs = (entities as TEntity[]).map(this.getKeyPairFromModel)

    const items: DynamoDB.DocumentClient.WriteRequests = keyPairs.map(
      (keyPair) => ({
        DeleteRequest: {
          Key: keyPair,
        },
      }),
    )

    await documentClient
      .batchWrite({
        RequestItems: {
          [this.tableName]: items,
        },
      })
      .promise()
  }

  /**
   * Saves multiple entities into the database.
   * @template TEntity
   * @param {DynamoDB.DocumentClient} documentClient The default documentClient or a documentClient instantiated through the AWS DAX service.
   * @param {TEntity[]} entities The new entities
   * @returns {Promise<Array<TEntity>>} A promise containing all the new entities that have been saved.
   */
  protected async internalBatchSave(
    documentClient: DynamoDB.DocumentClient,
    entities: TEntity[],
  ): Promise<TEntity[]> {
    const items: DynamoDB.DocumentClient.WriteRequests = entities.map(
      (entity) => ({
        PutRequest: {
          Item: entity,
        },
      }),
    )

    await documentClient
      .batchWrite({
        RequestItems: {
          [this.tableName]: items,
        },
      })
      .promise()

    return entities
  }

  /**
   * Saves a single new entity to the database.
   * @template TEntity
   * @param {DynamoDB.DocumentClient} documentClient The default documentClient or a documentClient instantiated through the AWS DAX service.
   * @param {TEntity} entity The to be saved entity.
   * @returns {Promise<Array<TEntity>>}
   */
  protected async internalSave(
    documentClient: DynamoDB.DocumentClient,
    entity: TEntity,
  ): Promise<TEntity> {
    await documentClient
      .put({
        TableName: this.tableName,
        Item: entity,
      })
      .promise()

    return entity
  }
}

export default BaseDynamoDataStorage
