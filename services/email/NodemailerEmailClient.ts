import { MailOptions } from 'nodemailer/lib/ses-transport'
import Mail from 'nodemailer/lib/mailer'

import EmailClient from './EmailClient'
import {
  EmailClientConfig,
  SendTemplatedEmailRequest,
} from './EmailClient/models'
import { Attachment, EmailContent } from '../../models/email'
import SESTemplateClient from './SESTemplateClient'
import EmailValidationError from '../../models/errors/email/EmailValidationError'

export interface NodemailerConfig extends EmailClientConfig {
  mailer: Mail
  templateClient: SESTemplateClient
  from: string
  requireBody?: boolean
  requireSubject?: boolean
  sourceArn?: string
}

class NodemailerEmailClient extends EmailClient<NodemailerConfig> {
  public constructor(config: NodemailerConfig) {
    super(config)
  }

  /**
   * Send an email via the Nodemailer SES email transport.
   * @protected
   * @throws { EmailValidationError } When the client is configured to require an html or text part in the email
   * and the request does not contain neither parts.
   * @throws { NoEmailSubjectError } When the client is configured to require a subject and
   * the request does not contain one.
   */
  protected async sendEmail<TValues>(
    params: SendTemplatedEmailRequest<TValues>,
  ): Promise<void> {
    const { to, templateName, templateValues, attachments } = params
    const { mailer, templateClient } = this.config

    const email = await templateClient.createEmailFromTemplate(
      templateName,
      templateValues,
    )
    this.validateEmailContent(email)

    const mailOptions = this.prepareMailerOptions(to, email, attachments)

    await mailer.sendMail(mailOptions)
  }

  private prepareMailerOptions(
    to: string[],
    email: EmailContent,
    attachments?: Attachment[],
  ): MailOptions {
    const mailerAttachments =
      attachments &&
      attachments.map((attachment) => ({
        filename: attachment.fileName,
        contentType: attachment.mimeType,
        content: attachment.data,
      }))

    const { from } = this.config
    const mailOptions: MailOptions = {
      from,
      to,
      attachments: mailerAttachments,
      ...email,
    }

    const { sourceArn } = this.config

    if (sourceArn) {
      mailOptions.ses = {
        SourceArn: sourceArn,
        FromArn: sourceArn,
      }
    }

    return mailOptions
  }

  private validateEmailContent(content: EmailContent): void {
    const { html, text, subject } = content
    const { requireSubject, requireBody } = this.config

    const hasEmailBody = html || text
    const noEmailBodyErrorCondition = !hasEmailBody && requireBody
    const noSubjectErrorCondition = !subject && requireSubject

    if (noEmailBodyErrorCondition || noSubjectErrorCondition) {
      const requiredParts = []
      if (requireBody) requiredParts.push('html/text')
      if (requireSubject) requiredParts.push('subject')

      throw new EmailValidationError(requiredParts)
    }
  }
}

export default NodemailerEmailClient
