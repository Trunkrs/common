import ErrorBase from '../ErrorBase'

class EmailValidationError extends ErrorBase {
  public constructor(requiredParts: string[]) {
    super()

    this.message = `Email must contain the following parts: ${requiredParts.join(
      ', ',
    )}.`
  }
}

export default EmailValidationError
