import DynamoOperator from './DynamoOperator'

class GreaterThan extends DynamoOperator<number | string> {
  public constructor(numberToExceed: number | string) {
    super([numberToExceed])
  }

  render(attributeName: string, paramOffset?: number): string {
    const actualOffset = paramOffset ?? 0

    return `#${attributeName} > ${this.makeAttrValueName(
      attributeName,
      actualOffset,
    )}`
  }

  public static fromValue(numberToExceed: number | string): GreaterThan {
    return new GreaterThan(numberToExceed)
  }
}

export default GreaterThan
