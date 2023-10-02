import WhereParameters from './QueryWhereStatement'

interface QueryParameters<TEntity> {
  where?: WhereParameters<TEntity>
  select?: Array<keyof TEntity>
  limit?: number
  orderDescending?: boolean
}

export default QueryParameters
