import DynamoOperator from '../../operators/DynamoOperator'

type WhereParameters<TEntity> = {
  [key in keyof TEntity]?: TEntity[key] | DynamoOperator
}

export default WhereParameters
