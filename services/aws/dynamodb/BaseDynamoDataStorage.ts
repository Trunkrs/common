/* eslint-disable no-await-in-loop */

import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import PaginatedFindResult from './interfaces/PaginatedFindResult'

abstract class BaseDynamoDataStorage<TEntity> {
  protected abstract readonly keys: Array<keyof TEntity>

  protected readonly documentClient: DynamoDBDocumentClient

  protected constructor(protected readonly tableName: string) {
    this.documentClient = DynamoDBDocumentClient.from(new DynamoDBClient(), {
      marshallOptions: { removeUndefinedValues: true },
    })
  }

  protected async executeQuery<TResultEntity = TEntity>(
    query: QueryCommandInput,
  ): Promise<TResultEntity[]> {
    const results = []
    let lastEvaluatedKey

    console.log('DDB Op', query)

    do {
      const command = new QueryCommand({
        ...query,
        ExclusiveStartKey: lastEvaluatedKey,
      })

      const page: QueryCommandOutput = await this.documentClient.send(command)
      if (page.Items?.length) {
        results.push(...page.Items)
      }

      lastEvaluatedKey = page.LastEvaluatedKey
    } while (lastEvaluatedKey)

    return results as TResultEntity[]
  }

  protected async executeScan<TResultEntity = TEntity>(
    query: ScanCommandInput,
  ): Promise<TResultEntity[]> {
    const results = []
    let lastEvaluatedKey

    console.log('DDB Op', query)

    do {
      const command = new ScanCommand({
        ...query,
        ExclusiveStartKey: lastEvaluatedKey,
      })

      const page: ScanCommandOutput = await this.documentClient.send(command)
      if (page.Items?.length) {
        results.push(...page.Items)
      }

      lastEvaluatedKey = page.LastEvaluatedKey
    } while (lastEvaluatedKey)

    return results as TResultEntity[]
  }

  protected async executePaginatedQuery<TResultEntity = TEntity>(
    query: QueryCommandInput,
    lastEvaluatedKey?: string,
  ): Promise<PaginatedFindResult<TResultEntity>> {
    const decodedLastEvaluatedKey: Record<string, any> | undefined =
      lastEvaluatedKey
        ? JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString('utf-8'))
        : undefined

    const command = new QueryCommand({
      ...query,
      ExclusiveStartKey: decodedLastEvaluatedKey,
    })

    const page = await this.documentClient.send(command)

    const items = (page.Items as TResultEntity[]) || []
    const newLastEvaluatedKey = page.LastEvaluatedKey
      ? Buffer.from(
          JSON.stringify(page.LastEvaluatedKey, null, 2),
          'utf-8',
        ).toString('base64')
      : undefined

    return {
      items,
      lastEvaluatedKey: newLastEvaluatedKey,
    }
  }

  protected async executePaginatedScan<TResultEntity = TEntity>(
    query: ScanCommandInput,
    lastEvaluatedKey?: string,
  ): Promise<PaginatedFindResult<TResultEntity>> {
    const decodedLastEvaluatedKey: Record<string, any> | undefined =
      lastEvaluatedKey
        ? JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString('utf-8'))
        : undefined

    const command = new ScanCommand({
      ...query,
      ExclusiveStartKey: decodedLastEvaluatedKey,
    })

    const page = await this.documentClient.send(command)

    const items = (page.Items as unknown as TResultEntity[]) || []
    const newLastEvaluatedKey = page.LastEvaluatedKey
      ? Buffer.from(
          JSON.stringify(page.LastEvaluatedKey, null, 2),
          'utf-8',
        ).toString('base64')
      : undefined

    return {
      items,
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
