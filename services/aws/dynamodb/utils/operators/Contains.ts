import DynamoOperator from './DynamoOperator'

class Contains extends DynamoOperator<string> {
  public constructor(partialValue: string) {
    super([partialValue])
  }

  public render(attributeName: string, paramOffset?: number): string {
    const actualOffset = paramOffset ?? 0

    return `contains(#${attributeName}, ${this.makeAttrValueName(
      attributeName,
      actualOffset,
    )})`
  }

  public static fromValue(partialValue: string): Contains {
    return new Contains(partialValue)
  }
}

export default Contains
