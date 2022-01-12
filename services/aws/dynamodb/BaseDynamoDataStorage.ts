/* eslint-disable no-await-in-loop */
import { DynamoDB } from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

abstract class BaseDynamoDataStorage<TEntity> {
  protected abstract readonly keys: Array<keyof TEntity>

  protected readonly documentClient: DynamoDB.DocumentClient

  protected constructor(protected readonly tableName: string) {
    this.documentClient = new DynamoDB.DocumentClient()
  }

  protected async executeOperation<TResultEntity = TEntity>(
    operation: 'Scan' | 'Query',
    query: DynamoDB.DocumentClient.ScanInput,
  ): Promise<TResultEntity[]> {
    const results = []
    let lastEvaluatedKey

    console.log('DDB Op', query)

    do {
      const page: DocumentClient.QueryOutput =
        operation === 'Scan'
          ? await this.documentClient
              .scan({ ...query, ExclusiveStartKey: lastEvaluatedKey })
              .promise()
          : await this.documentClient
              .query({ ...query, ExclusiveStartKey: lastEvaluatedKey })
              .promise()

      if (page.Items?.length) {
        results.push(...page.Items)
      }

      lastEvaluatedKey = page.LastEvaluatedKey
    } while (lastEvaluatedKey)

    return results as TResultEntity[]
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
