import ErrorBase from '../ErrorBase'

class EmailHasNoSubjectError extends ErrorBase {
  public constructor() {
    super()

    this.message = `The email you are about to send has no subject configured.`
  }
}

export default EmailHasNoSubjectError
