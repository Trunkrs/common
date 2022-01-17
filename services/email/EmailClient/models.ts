import Environment from '../../../models/enum/Environment'
import Attachment from '../../../models/email/Attachment'

export interface RecipientValidationConfig {
  /**
   * A list of domains that are whitelisted for receiving emails.
   */
  allowedDomains: string[]

  /**
   * If set, the included array of environments are exempted from the validation
   */
  disableOnEnvironment?: Environment[]
}

export interface EmailClientConfig {
  /**
   * The stage where the current instance of the client is running
   */
  stage: Environment

  /**
   * If set, recipient email addresses are filtered against a list of allowed domains.
   */
  validateRecipientDomains?: RecipientValidationConfig
}

export interface SendTemplatedEmailRequest<TValues> {
  /**
   * @param { string[] } to - The destination email addresses.
   */
  to: string[]

  /**
   * @param { string } templateName - The name of the template to retrieve from SES.
   */
  templateName: string

  /**
   * @template TValues
   * @param { TValues } templateValues - The values to replace the template with.
   */
  templateValues: TValues

  /**
   * @param { Attachment } [attachments] - An optional list of attachments.
   */
  attachments?: Attachment[]
}
