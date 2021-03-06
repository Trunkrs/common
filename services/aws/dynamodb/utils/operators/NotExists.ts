import DynamoOperator from './DynamoOperator'

class Exists extends DynamoOperator {
  public constructor() {
    super([])
  }

  render(attributeName: string): string {
    return `attribute_not_exists(#${attributeName})`
  }
}

export default Exists
