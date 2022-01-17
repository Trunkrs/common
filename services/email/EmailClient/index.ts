import { EmailClientConfig, SendTemplatedEmailRequest } from './models'
import InvalidEmailAddressesError from '../../../models/errors/email/InvalidEmailAddressesError'

abstract class EmailClient<
  TConfig extends EmailClientConfig = EmailClientConfig,
> {
  protected constructor(protected readonly config: TConfig) {}

  /**
   * Sends a templated email. Supports attachments.
   *
   * @template TValues
   * @throws { InvalidEmailAddressesError } When the send email request contains a recipient
   * email address whose domain has not been whitelisted.
   */
  public async sendTemplatedEmail<TValues>(
    params: SendTemplatedEmailRequest<TValues>,
  ): Promise<void> {
    this.validateRecipientDomains(params.to)

    await this.sendEmail(params)
  }

  protected abstract sendEmail<TValues>(
    params: SendTemplatedEmailRequest<TValues>,
  ): Promise<void>

  private validateRecipientDomains(to: string[]): void {
    const { stage, validateRecipientDomains } = this.config

    if (!validateRecipientDomains) {
      return
    }

    const isValidationDisabled =
      validateRecipientDomains.disableOnEnvironment &&
      validateRecipientDomains.disableOnEnvironment.includes(stage)

    if (isValidationDisabled) {
      return
    }
    const { allowedDomains } = validateRecipientDomains

    const hasInvalidRecipientDomains =
      allowedDomains && this.areRecipientDomainsInvalid(to, allowedDomains)

    if (hasInvalidRecipientDomains) {
      throw new InvalidEmailAddressesError(allowedDomains)
    }
  }

  private areRecipientDomainsInvalid(
    addresses: string[],
    allowedDomains: string[],
  ): boolean {
    return addresses.some((address) => {
      const [, domain] = address.split('@')

      return !allowedDomains.includes(domain)
    })
  }
}

export default EmailClient
