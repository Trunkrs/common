import DynamoOperator from './DynamoOperator'

class LesserThan extends DynamoOperator<number | string> {
  public constructor(numberToMaintain: number | string) {
    super([numberToMaintain])
  }

  render(attributeName: string, paramOffset?: number): string {
    const actualOffset = paramOffset ?? 0
    return `#${attributeName} < ${this.makeAttrValueName(
      attributeName,
      actualOffset,
    )}`
  }

  public static fromValue(numberToMaintain: number | string): LesserThan {
    return new LesserThan(numberToMaintain)
  }
}

export default LesserThan
