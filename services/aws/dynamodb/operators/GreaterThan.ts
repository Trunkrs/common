import DynamoOperator from './DynamoOperator'

class GreaterThan extends DynamoOperator<number | string> {
  public constructor(numberToExceed: number | string) {
    super([numberToExceed])
  }

  render(attributeName: string): string {
    return `#${attributeName} > :${attributeName}0`
  }

  public static fromValue(numberToExceed: number | string): GreaterThan {
    return new GreaterThan(numberToExceed)
  }
}

export default GreaterThan
