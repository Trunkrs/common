import DynamoOperator from './DynamoOperator'

class In extends DynamoOperator<number | string> {
  render(attributeName: string): string {
    const attributeValueMappings = this.attributeValues.map(
      (_, index) => `:${attributeName}${index}`,
    )

    return `#${attributeName} IN (${attributeValueMappings.join(', ')})`
  }

  public static fromValue(values: Array<string | number>): In {
    return new In(values)
  }
}

export default In
