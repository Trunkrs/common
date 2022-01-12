import DynamoOperator from './DynamoOperator'

class Or extends DynamoOperator {
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
      .join(' OR ')

    return `(${clauseBody})`
  }
}

export default Or
