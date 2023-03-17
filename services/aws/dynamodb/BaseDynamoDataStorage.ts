/* eslint-disable no-await-in-loop */
import AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'
import PaginatedFindResult from './interfaces/PaginatedFindResult'
import getAWS from '../../../utils/getAWS'

const { DynamoDB } = getAWS()

abstract class BaseDynamoDataStorage<TEntity> {
  protected abstract readonly keys: Array<keyof TEntity>

  protected readonly documentClient: AWS.DynamoDB.DocumentClient

  protected constructor(protected readonly tableName: string) {
    this.documentClient = new DynamoDB.DocumentClient()
  }

  protected async executeOperation<TResultEntity = TEntity>(
    operation: 'Scan' | 'Query',
    query: AWS.DynamoDB.DocumentClient.ScanInput,
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

  protected async executePaginatedOperation<TResultEntity = TEntity>(
    operation: 'Scan' | 'Query',
    query: AWS.DynamoDB.DocumentClient.ScanInput,
    lastEvaluatedKey?: string
  ): Promise<PaginatedFindResult<TResultEntity>> {
    const results = []
    console.log('DDB Op', query)
    let decodedLastEvaluatedKey: AWS.DynamoDB.Key | undefined

    if (lastEvaluatedKey) {
      decodedLastEvaluatedKey = JSON.parse(
        Buffer
          .from(lastEvaluatedKey, 'base64')
          .toString('utf-8')
      )
    }

    const page: DocumentClient.QueryOutput =
      operation === 'Scan'
        ? await this.documentClient
          .scan({
            ...query,
            ExclusiveStartKey: decodedLastEvaluatedKey,
          })
          .promise()
        : await this.documentClient
          .query({
            ...query,
            ExclusiveStartKey: decodedLastEvaluatedKey,
          })
          .promise()

    if (page.Items?.length) {
      results.push(...page.Items)
    }

    let newLastEvaluatedKey: string | undefined
    if (page.LastEvaluatedKey) {
      newLastEvaluatedKey = Buffer
        .from(
          JSON.stringify(page.LastEvaluatedKey, null, 2),
          'utf-8',
        ).toString('base64')
    }

    return {
      items: results as TResultEntity[],
      lastEvaluatedKey: newLastEvaluatedKey,
    }
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
