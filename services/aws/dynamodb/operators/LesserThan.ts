import DynamoOperator from './DynamoOperator'

class LesserThan extends DynamoOperator<number | string> {
  public constructor(numberToMaintain: number | string) {
    super([numberToMaintain])
  }

  render(attributeName: string): string {
    return `#${attributeName} < :${attributeName}0`
  }

  public static fromValue(numberToMaintain: number | string): LesserThan {
    return new LesserThan(numberToMaintain)
  }
}

export default LesserThan
