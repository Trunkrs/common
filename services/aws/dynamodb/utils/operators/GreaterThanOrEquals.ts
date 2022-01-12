import DynamoOperator from './DynamoOperator'

class GreaterThanOrEquals extends DynamoOperator<number | string> {
  public constructor(valueToExceedOrMatch: number | string) {
    super([valueToExceedOrMatch])
  }

  render(attributeName: string, paramOffset?: number): string {
    const actualOffset = paramOffset ?? 0

    return `#${attributeName} >= ${this.makeAttrValueName(
      attributeName,
      actualOffset,
    )}`
  }

  public static fromValue(
    valueToExceedOrMatch: number | string,
  ): GreaterThanOrEquals {
    return new GreaterThanOrEquals(valueToExceedOrMatch)
  }
}

export default GreaterThanOrEquals
