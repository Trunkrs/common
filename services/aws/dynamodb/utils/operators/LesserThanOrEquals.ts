import DynamoOperator from './DynamoOperator'

class LesserThanOrEquals extends DynamoOperator<number | string> {
  public constructor(valueToMaintainOrMatch: number | string) {
    super([valueToMaintainOrMatch])
  }

  render(attributeName: string, paramOffset?: number): string {
    const actualOffset = paramOffset ?? 0
    return `#${attributeName} <= ${this.makeAttrValueName(
      attributeName,
      actualOffset,
    )}`
  }

  public static fromValue(
    valueToMaintainOrMatch: number | string,
  ): LesserThanOrEquals {
    return new LesserThanOrEquals(valueToMaintainOrMatch)
  }
}

export default LesserThanOrEquals
