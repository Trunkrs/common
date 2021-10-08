import WhereParameters from './QueryWhereStatement'

interface QueryParameters<TEntity> {
  where: WhereParameters<TEntity>
  select?: Array<keyof TEntity>
  limit?: number
}

export default QueryParameters
