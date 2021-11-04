import DynamoOperator from './DynamoOperator'

class Contains extends DynamoOperator<string> {
  public constructor(partialValue: string) {
    super([partialValue])
  }

  public render(attributeName: string): string {
    return `contains(#${attributeName}, :${attributeName}0)`
  }

  public static fromValue(partialValue: string): Contains {
    return new Contains(partialValue)
  }
}

export default Contains
