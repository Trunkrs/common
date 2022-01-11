import DynamoOperator from './DynamoOperator'

class And extends DynamoOperator {
  public constructor(private readonly innerOperators: DynamoOperator[]) {
    super([])
  }

  render(attributeName: string): string {
    const clauseBody = this.innerOperators
      .map((operator) => operator.render(attributeName))
      .join(' AND ')

    return `(${clauseBody})`
  }
}

export default And
