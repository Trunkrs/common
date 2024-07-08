import ErrorBase from '../ErrorBase'

class EmailDomainNotAllowedOnEnvironmentError extends ErrorBase {
  public constructor(
    stage: string,
    allowedDomains: string[],
    foundAddresses: string[],
  ) {
    super()

    this.message = `The email addresses ${foundAddresses}, are not allowed on Environment: "${stage}". Only addresses ending in ${allowedDomains} are considered as valid.`
  }
}

export default EmailDomainNotAllowedOnEnvironmentError
