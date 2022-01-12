import DynamoOperator from './DynamoOperator'

class NotEquals extends DynamoOperator<number | string> {
  public constructor(valueToExclude: number | string) {
    super([valueToExclude])
  }

  render(attributeName: string, paramOffset?: number): string {
    const actualOffset = paramOffset ?? 0
    return `#${attributeName} <> ${this.makeAttrValueName(
      attributeName,
      actualOffset,
    )}`
  }

  public static fromValue(valueToExclude: number | string): NotEquals {
    return new NotEquals(valueToExclude)
  }
}

export default NotEquals
