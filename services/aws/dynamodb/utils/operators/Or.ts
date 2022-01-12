import DynamoOperator from './DynamoOperator'

class Or extends DynamoOperator {
  public constructor(private readonly innerOperators: DynamoOperator[]) {
    super([])
  }

  render(attributeName: string): string {
    const clauseBody = this.innerOperators
      .map((operator) => operator.render(attributeName))
      .join(' OR ')

    return `(${clauseBody})`
  }
}

export default Or
