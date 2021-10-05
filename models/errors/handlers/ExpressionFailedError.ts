import { ErrorBase } from '..'

class ExpressionFailedError extends ErrorBase {
  public constructor() {
    super()

    this.message = 'The expression failed to execute on the specified target.'
  }
}

export default ExpressionFailedError
