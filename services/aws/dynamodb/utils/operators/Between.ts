import DynamoOperator from './DynamoOperator'

class Between extends DynamoOperator<number> {
  public constructor(valueStart: number, valueEnd: number) {
    super([valueStart, valueEnd])
  }

  render(attributeName: string, paramOffset?: number): string {
    const actualOffset = paramOffset ?? 0

    return `#${attributeName} BETWEEN ${this.makeAttrValueName(
      attributeName,
      actualOffset,
    )} AND ${this.makeAttrValueName(attributeName, 1)}`
  }

  public static fromValue(valueStart: number, valueEnd: number): Between {
    return new Between(valueStart, valueEnd)
  }
}

export default Between
