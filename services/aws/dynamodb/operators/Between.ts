import DynamoOperator from './DynamoOperator'

class Between extends DynamoOperator<number> {
  public constructor(valueStart: number, valueEnd: number) {
    super([valueStart, valueEnd])
  }

  render(attributeName: string): string {
    return `#${attributeName} BETWEEN :${attributeName}0 AND :${attributeName}1`
  }

  public static fromValue(
    valueStart: number,
    valueEnd: number,
  ): Between {
    return new Between(valueStart, valueEnd)
  }
}

export default Between
