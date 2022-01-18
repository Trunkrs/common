import ErrorBase from '../ErrorBase'

class EmailValidationError extends ErrorBase {
  public constructor() {
    super()

    this.message = `Email is either missing a subject and/or a body, or recipient/s are from an invalid domain.`
  }
}

export default EmailValidationError
