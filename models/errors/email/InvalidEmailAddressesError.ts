import ErrorBase from '../ErrorBase'

class InvalidEmailAddressesError extends ErrorBase {
  public constructor(validDomains: string[]) {
    super()

    const joinedValidDomains = validDomains.join(', ')
    this.message = `All email addresses must be sent to [email]@[domain].  Valid domains: ${joinedValidDomains}`
  }
}

export default InvalidEmailAddressesError
