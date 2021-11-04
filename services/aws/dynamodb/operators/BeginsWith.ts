import DynamoOperator from './DynamoOperator'

class BeginsWith extends DynamoOperator<string> {
  public constructor(startValue: string) {
    super([startValue])
  }

  public render(attributeName: string): string {
    return `begins_with(#${attributeName}, ${this.makeAttrValueName(
      attributeName,
      0,
    )})`
  }

  public static fromValue(startValue: string): BeginsWith {
    return new BeginsWith(startValue)
  }
}

export default BeginsWith
