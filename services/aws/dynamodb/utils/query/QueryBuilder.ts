import { DynamoDB } from 'aws-sdk'

import DynamoOperator from '../operators/DynamoOperator'

import WhereParameters from './QueryWhereStatement'
import QueryParameters from './QueryParameters'

import { OperationNotSupportedError } from '../../../../../models/errors'
import WhereClauseNotProvidedError from '../../errors/WhereClauseNotProvidedError'

interface SplitConditionalKeys<TEntity> {
  keyCondition: WhereParameters<TEntity>
  filterCondition: WhereParameters<TEntity>
}

export interface QueryBuilderParams<TEntity> {
  query: QueryParameters<TEntity>
  tableName: string
  primaryKeys: Array<keyof TEntity>
  indexName?: string
}

class QueryBuilder {
  private static buildProjectionExpression<TEntity>(
    selectStatement: Array<keyof TEntity>,
  ): string | undefined {
    if (!selectStatement.length) {
      return undefined
    }

    return selectStatement.join(', ')
  }

  private static buildAttributeValues<TEntity>(
    where: WhereParameters<TEntity>,
  ): NodeJS.Dict<string | number> {
    return Object.keys(where).reduce((values, key: string) => {
      if ((where[key as keyof TEntity] as any) instanceof DynamoOperator) {
        const operator = where[key as keyof TEntity] as DynamoOperator
        const attributes = operator.attributeValues.reduce(
          (attrDict, value, index) =>
            Object.assign(attrDict, {
              [operator.makeAttrValueName(key, index)]: value,
            }),
          {},
        )

        return { ...values, ...attributes }
      }

      return {
        ...values,
        [`:${key}`]: where[key as keyof TEntity],
      }
    }, {})
  }

  private static buildAttributeNames<TEntity>(
    where: WhereParameters<TEntity>,
  ): NodeJS.Dict<string> {
    return Object.keys(where).reduce(
      (keys, currentKey) => ({
        ...keys,
        [`#${currentKey}`]: currentKey,
      }),
      {},
    )
  }

  private static buildQueryStatements<TEntity>(
    whereStatement: WhereParameters<TEntity>,
  ): string[] {
    return Object.keys(whereStatement).map((key) => {
      if (
        (whereStatement[key as keyof TEntity] as any) instanceof DynamoOperator
      ) {
        const operator = whereStatement[key as keyof TEntity] as DynamoOperator
        return operator.render(key)
      }

      return `#${key} = :${key}`
    })
  }

  private static buildExpression<TEntity>(
    whereStatement: WhereParameters<TEntity>,
  ): string | undefined {
    if (!Object.keys(whereStatement).length) {
      return undefined
    }

    const statements = this.buildQueryStatements(whereStatement)

    return statements.join(' AND ')
  }

  private static splitKeyAndFilterCondition<TEntity>(
    where: WhereParameters<TEntity>,
    primaryKeys: Array<keyof TEntity>,
  ): SplitConditionalKeys<TEntity> {
    const keyCondition: WhereParameters<TEntity> = {}
    const filterCondition: WhereParameters<TEntity> = {}

    Object.keys(where).forEach((key) => {
      if (primaryKeys.includes(key as keyof TEntity)) {
        keyCondition[key as keyof TEntity] = where[key as keyof TEntity]
      } else {
        filterCondition[key as keyof TEntity] = where[key as keyof TEntity]
      }
    })

    return {
      filterCondition,
      keyCondition,
    }
  }

  public static buildScan<TEntity>({
    query,
    tableName,
    indexName,
  }: QueryBuilderParams<TEntity>): DynamoDB.DocumentClient.ScanInput {
    const { where, limit, select, orderDescending } = query

    if (orderDescending) {
      throw new OperationNotSupportedError(
        `Descending order can't be enforced when using a Scan operation as no index is being evaluated. If descending order is important to the evaluation, please consider using a Query operation instead.`,
      )
    }

    const op: DynamoDB.DocumentClient.ScanInput = {
      TableName: tableName,
      IndexName: indexName,
      Limit: limit,
    }

    if (select && select.length) {
      op.ProjectionExpression = QueryBuilder.buildProjectionExpression(select)
    }

    if (where && Object.values(where).length) {
      op.FilterExpression = this.buildExpression(where)
      op.ExpressionAttributeNames = QueryBuilder.buildAttributeNames(where) as {
        [key: string]: string
      }
      op.ExpressionAttributeValues = this.buildAttributeValues(where)
    }

    return op
  }

  public static buildQuery<TEntity>({
    query,
    primaryKeys,
    tableName,
    indexName,
  }: QueryBuilderParams<TEntity>): DynamoDB.DocumentClient.QueryInput {
    const { where, limit, select, orderDescending } = query

    if (!where || !Object.values(where).length) {
      // Where clauses must be provided on Query operations in dynamoDB
      throw new WhereClauseNotProvidedError()
    }

    const { keyCondition, filterCondition } = this.splitKeyAndFilterCondition(
      where,
      primaryKeys,
    )

    const op: DynamoDB.DocumentClient.QueryInput = {
      TableName: tableName,
      IndexName: indexName,
      Limit: limit,
      ScanIndexForward: !orderDescending,
      KeyConditionExpression: this.buildExpression(keyCondition),
      FilterExpression: this.buildExpression(filterCondition),
      ExpressionAttributeNames: QueryBuilder.buildAttributeNames(where) as {
        [key: string]: string
      },
      ExpressionAttributeValues: this.buildAttributeValues(where),
    }

    if (select) {
      op.ProjectionExpression = QueryBuilder.buildProjectionExpression(select)
    }

    return op
  }
}

export default QueryBuilder
