import ErrorBase from '../../../../models/errors/ErrorBase'

class WhereClauseNotProvidedError extends ErrorBase {
  public constructor() {
    super()

    this.message = 'A where clause must be provided for this DynamoDB operation'
  }
}

export default WhereClauseNotProvidedError
