import DynamoOperator from './DynamoOperator'

class And extends DynamoOperator {
  public constructor(private readonly innerOperators: DynamoOperator[]) {
    super(innerOperators.flatMap((op) => op.attributeValues))
  }

  render(attributeName: string): string {
    let offset = 0
    const clauseBody = this.innerOperators
      .map((operator) => {
        const result = operator.render(attributeName, offset)
        offset += operator.attributeValues.length

        return result
      })
      .join(' AND ')

    return `(${clauseBody})`
  }
}

export default And
