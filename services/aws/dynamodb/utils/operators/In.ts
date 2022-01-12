import DynamoOperator from './DynamoOperator'

class In extends DynamoOperator<number | string> {
  render(attributeName: string, paramOffset?: number): string {
    const actualOffset = paramOffset ?? 0

    const attributeValueMappings = this.attributeValues.map((_, index) =>
      this.makeAttrValueName(attributeName, actualOffset + index),
    )

    return `#${attributeName} IN (${attributeValueMappings.join(', ')})`
  }

  public static fromValue(values: Array<string | number>): In {
    return new In(values)
  }
}

export default In
