import ErrorBase from '../ErrorBase'

class EmailHasNoBodyError extends ErrorBase {
  public constructor() {
    super()

    this.message = `The email you are about to send has no HTML or TEXT body.`
  }
}

export default EmailHasNoBodyError
