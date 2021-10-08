import { DynamoDB } from 'aws-sdk'

import { DynamoDataStorage as IDynamoDataStorage } from './interfaces'
import { PrimaryKey, QueryBuilder, QueryParameters } from './utils'
import BaseDynamoDataStorage from './BaseDynamoDataStorage'

abstract class DynamoDataStorage<TEntity>
  extends BaseDynamoDataStorage<TEntity>
  implements IDynamoDataStorage<TEntity>
{
  protected constructor(
    protected readonly documentClient: DynamoDB.DocumentClient,
    tableName: string,
    queryBuilder: typeof QueryBuilder,
  ) {
    super(tableName, queryBuilder)
  }

  public batchSave(entities: TEntity[]): Promise<TEntity[]> {
    return this.internalBatchSave(this.documentClient, entities)
  }

  public save(entity: TEntity): Promise<TEntity> {
    return this.internalSave(this.documentClient, entity)
  }

  public remove(key: PrimaryKey<TEntity>): Promise<void> {
    return this.internalRemove(this.documentClient, key)
  }

  public batchRemove(entities: Partial<TEntity>[]): Promise<void> {
    return this.internalBatchRemove(this.documentClient, entities)
  }

  public batchGet(keys: PrimaryKey<TEntity>[]): Promise<TEntity[]> {
    return this.internalBatchGet(this.documentClient, keys)
  }

  public find(query: QueryParameters<TEntity>): Promise<TEntity[]> {
    return this.internalFind(this.documentClient, query)
  }

  public findOne(query: QueryParameters<TEntity>): Promise<TEntity | null> {
    return this.internalFindOne(this.documentClient, query)
  }

  public get(key: PrimaryKey<TEntity>): Promise<TEntity | null> {
    return this.internalGet(this.documentClient, key)
  }
}

export default DynamoDataStorage
