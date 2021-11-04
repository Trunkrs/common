import DynamoOperator from './DynamoOperator'

class LesserThanOrEquals extends DynamoOperator<number | string> {
  public constructor(valueToMaintainOrMatch: number | string) {
    super([valueToMaintainOrMatch])
  }

  render(attributeName: string): string {
    return `#${attributeName} <= ${this.makeAttrValueName(attributeName, 0)}`
  }

  public static fromValue(
    valueToMaintainOrMatch: number | string,
  ): LesserThanOrEquals {
    return new LesserThanOrEquals(valueToMaintainOrMatch)
  }
}

export default LesserThanOrEquals
