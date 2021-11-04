import DynamoOperator from './DynamoOperator'

class GreaterThanOrEquals extends DynamoOperator<number | string> {
  public constructor(valueToMaintainOrMatch: number | string) {
    super([valueToMaintainOrMatch])
  }

  render(attributeName: string): string {
    return `#${attributeName} <= :${attributeName}0`
  }

  public static fromValue(
    valueToMaintainOrMatch: number | string,
  ): GreaterThanOrEquals {
    return new GreaterThanOrEquals(valueToMaintainOrMatch)
  }
}

export default GreaterThanOrEquals
