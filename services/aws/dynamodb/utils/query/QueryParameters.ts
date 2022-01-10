import WhereParameters from './QueryWhereStatement'

interface QueryParameters<TEntity> {
  queryOptions?: {
    operation?: 'Scan' | 'Query'
  }
  where: WhereParameters<TEntity>
  select?: Array<keyof TEntity>
  limit?: number
  orderDescending?: boolean
}

export default QueryParameters
