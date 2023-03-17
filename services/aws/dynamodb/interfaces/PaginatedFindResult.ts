interface PaginatedFindResult<TResultEntity> {
  items: TResultEntity[]
  lastEvaluatedKey?: string
}

export default PaginatedFindResult
