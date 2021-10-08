type PrimaryKey<TEntity> = { [key in keyof TEntity]?: TEntity[key] }

export default PrimaryKey
