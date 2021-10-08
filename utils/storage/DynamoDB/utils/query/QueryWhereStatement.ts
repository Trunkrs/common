import BeginsWith from './operators/BeginsWith'

type WhereParameters<TEntity> = {
  [key in keyof TEntity]?: TEntity[key] | BeginsWith
}

export default WhereParameters
