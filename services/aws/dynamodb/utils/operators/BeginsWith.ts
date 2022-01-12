import DynamoOperator from './DynamoOperator'

class BeginsWith extends DynamoOperator<string> {
  public constructor(startValue: string) {
    super([startValue])
  }

  public render(attributeName: string, paramOffset?: number): string {
    const actualOffset = paramOffset ?? 0

    return `begins_with(#${attributeName}, ${this.makeAttrValueName(
      attributeName,
      actualOffset,
    )})`
  }

  public static fromValue(startValue: string): BeginsWith {
    return new BeginsWith(startValue)
  }
}

export default BeginsWith
