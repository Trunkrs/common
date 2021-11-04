import DynamoOperator from './DynamoOperator'

class GreaterThanOrEquals extends DynamoOperator<number> {
  public constructor(valueStart: number, valueEnd: number) {
    super([valueStart, valueEnd])
  }

  render(attributeName: string): string {
    return `#${attributeName} BETWEEN :${attributeName}0 AND :${attributeName}1`
  }

  public static fromValue(
    valueStart: number,
    valueEnd: number,
  ): GreaterThanOrEquals {
    return new GreaterThanOrEquals(valueStart, valueEnd)
  }
}

export default GreaterThanOrEquals
