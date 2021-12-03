import { DynamoDB } from 'aws-sdk'

import DynamoOperator from '../operators/DynamoOperator'

import WhereParameters from './QueryWhereStatement'
import QueryParameters from './QueryParameters'

interface SplitConditionalKeys<TEntity> {
  keyCondition: WhereParameters<TEntity>
  filterCondition: WhereParameters<TEntity>
}

export interface QueryOperation {
  operation: 'Query' | 'Scan'
  query: DynamoDB.DocumentClient.QueryInput
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

  public static buildQuery<TEntity>(
    query: QueryParameters<TEntity>,
    tableName: string,
    primaryKeys: Array<keyof TEntity>,
    indexName?: string,
  ): QueryOperation {
    const { where, limit, select } = query

    const { keyCondition, filterCondition } = this.splitKeyAndFilterCondition(
      where,
      primaryKeys,
    )

    const keyExpression = this.buildExpression(keyCondition)

    const op = {
      operation: keyExpression ? 'Query' : 'Scan',
      query: {
        TableName: tableName,
        IndexName: indexName,
        Limit: limit,
        ProjectionExpression: select
          ? QueryBuilder.buildProjectionExpression(select)
          : undefined,
        KeyConditionExpression: keyExpression,
        FilterExpression: this.buildExpression(filterCondition),
        ExpressionAttributeNames: QueryBuilder.buildAttributeNames(where) as {
          [key: string]: string
        },
        ExpressionAttributeValues: this.buildAttributeValues(where),
      },
    }
    console.log('Execution ddb operation', op)

    return op
  }
}

export default QueryBuilder
