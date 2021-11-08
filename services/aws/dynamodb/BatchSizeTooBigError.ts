import ErrorBase from '../../../models/errors/ErrorBase'

class BatchSizeTooBigError extends ErrorBase {
  public constructor() {
    super()

    this.message = 'BatchSizes cannot be bigger than 24 with dynamodb write actions'
  }
}

export default BatchSizeTooBigError
