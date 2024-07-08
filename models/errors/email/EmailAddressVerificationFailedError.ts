import ErrorBase from '../ErrorBase'

class EmailAddressVerificationFailedError extends ErrorBase {
  public constructor(foundAddress: string) {
    super()

    this.message = `The email ${foundAddress} is not a valid email.`
  }
}

export default EmailAddressVerificationFailedError
