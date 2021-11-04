import DynamoOperator from './DynamoOperator'

class NotEquals extends DynamoOperator<number | string> {
  public constructor(valueToExclude: number | string) {
    super([valueToExclude])
  }

  render(attributeName: string): string {
    return `#${attributeName} <> ${this.makeAttrValueName(attributeName, 0)}`
  }

  public static fromValue(valueToExclude: number | string): NotEquals {
    return new NotEquals(valueToExclude)
  }
}

export default NotEquals
