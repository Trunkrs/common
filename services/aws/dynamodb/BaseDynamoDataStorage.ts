import { AWSError, DynamoDB } from 'aws-sdk'

import { Key } from 'aws-sdk/clients/dynamodb'
import { PromiseResult } from 'aws-sdk/lib/request'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

import { QueryOperation } from './utils'

abstract class BaseDynamoDataStorage<TEntity> {
  protected abstract readonly keys: Array<keyof TEntity>

  protected readonly documentClient: DynamoDB.DocumentClient

  protected constructor(protected readonly tableName: string) {
    this.documentClient = new DynamoDB.DocumentClient()
  }

  protected executeQueryOperation(
    { operation, query }: QueryOperation,
    lastKey?: Key,
  ): Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>> {
    return operation === 'Query'
      ? this.documentClient
          .query({ ...query, ExclusiveStartKey: lastKey })
          .promise()
      : this.documentClient
          .scan({ ...query, ExclusiveStartKey: lastKey })
          .promise()
  }

  protected getKeyPairFromModel(model: TEntity): Partial<TEntity> {
    const keyDictionary: Partial<TEntity> = {}

    this.keys.forEach((key) => {
      keyDictionary[key] = model[key]
    })

    return keyDictionary
  }
}

export default BaseDynamoDataStorage
