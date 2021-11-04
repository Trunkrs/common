import DynamoOperator from './DynamoOperator'

class GreaterThanOrEquals extends DynamoOperator<number | string> {
  public constructor(valueToExceedOrMatch: number | string) {
    super([valueToExceedOrMatch])
  }

  render(attributeName: string): string {
    return `#${attributeName} >= :${attributeName}0`
  }

  public static fromValue(
    valueToExceedOrMatch: number | string,
  ): GreaterThanOrEquals {
    return new GreaterThanOrEquals(valueToExceedOrMatch)
  }
}

export default GreaterThanOrEquals
