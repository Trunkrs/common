import { DynamoDB } from 'aws-sdk'

import BeginsWith from './operators/BeginsWith'
import WhereParameters from './QueryWhereStatement'
import QueryParameters from './QueryParameters'

interface SplitConditionalKeys<TEntity> {
  keyCondition: WhereParameters<TEntity>
  filterCondition: WhereParameters<TEntity>
}

const buildQueryStatements = <TEntity>(
  whereStatement: WhereParameters<TEntity>,
): string[] =>
  Object.keys(whereStatement).map((key) => {
    if (whereStatement[key as keyof TEntity] instanceof BeginsWith) {
      return (whereStatement[key as keyof TEntity] as BeginsWith).render(key)
    }

    return `#${key} = :${key}`
  })

const buildExpression = <TEntity>(
  whereStatement: WhereParameters<TEntity>,
): string | undefined => {
  if (!Object.keys(whereStatement).length) {
    return undefined
  }

  const statements = buildQueryStatements(whereStatement)

  return statements.join(' AND ')
}

const buildAttributeNames = <TEntity>(
  where: WhereParameters<TEntity>,
): NodeJS.Dict<string> =>
  Object.keys(where).reduce(
    (keys, currentKey) => ({
      ...keys,
      [`#${currentKey}`]: currentKey,
    }),
    {},
  )

const buildAttributeValues = <TEntity>(
  where: WhereParameters<TEntity>,
): NodeJS.Dict<string | number> =>
  Object.keys(where).reduce((values, key: string) => {
    if (where[key as keyof TEntity] instanceof BeginsWith) {
      return {
        ...values,
        [`:${key}`]: (where[key as keyof TEntity] as BeginsWith).attributeValue,
      }
    }

    return {
      ...values,
      [`:${key}`]: where[key as keyof TEntity],
    }
  }, {})

const splitKeyAndFilterCondition = <TEntity>(
  where: WhereParameters<TEntity>,
  primaryKeys: Array<keyof TEntity>,
): SplitConditionalKeys<TEntity> => {
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

const buildProjectionExpression = <TEntity>(
  selectStatement: Array<keyof TEntity>,
): string | undefined => {
  if (!selectStatement.length) {
    return undefined
  }

  return selectStatement.join(', ')
}

const queryBuilder = <TEntity>(
  query: QueryParameters<TEntity>,
  tableName: string,
  primaryKeys: Array<keyof TEntity>,
  indexName?: string
): DynamoDB.DocumentClient.QueryInput => {
  const { where, limit, select } = query

  const { keyCondition, filterCondition } = splitKeyAndFilterCondition(
    where,
    primaryKeys,
  )

  return {
    TableName: tableName,
    IndexName: indexName,
    Limit: limit,
    ProjectionExpression: select
      ? buildProjectionExpression(select)
      : undefined,
    KeyConditionExpression: buildExpression(keyCondition),
    FilterExpression: buildExpression(filterCondition),
    ExpressionAttributeNames: buildAttributeNames(where) as {
      [key: string]: string
    },
    ExpressionAttributeValues: buildAttributeValues(where),
  }
}

export default queryBuilder
