import WhereParameters from './QueryWhereStatement'

interface QueryParameters<TEntity> {
  queryOptions?: {
    operation?: 'Scan' | 'Query'
    descendingOrder?: boolean
  }
  where: WhereParameters<TEntity>
  select?: Array<keyof TEntity>
  limit?: number
}

export default QueryParameters
