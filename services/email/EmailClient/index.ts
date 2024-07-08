import { EmailDomainNotAllowedOnEnvironmentError } from '../../../models/errors/email'
import { EmailClientConfig, SendTemplatedEmailRequest } from './models'

abstract class EmailClient<
  TConfig extends EmailClientConfig = EmailClientConfig,
> {
  protected constructor(protected readonly config: TConfig) {}

  /**
   * Sends a templated email. Supports attachments.
   *
   * @template TValues
   * @throws { EmailValidationError } When the send email request contains a recipient
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

    const invalidDomains = to.filter((address) => {
      const [, domain] = address.split('@')

      return !allowedDomains.some((allowedDomain) => allowedDomain === domain)
    })

    if (invalidDomains) {
      throw new EmailDomainNotAllowedOnEnvironmentError(
        stage,
        allowedDomains,
        to,
      )
    }
  }
}

export default EmailClient
