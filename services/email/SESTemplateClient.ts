import Template from '../../models/email/Template'
import EmailContent from '../../models/email/EmailContent'

import SESTemplateCache from './SESTemplateCache'
import TemplateClient from './TemplateClient'

class SESTemplateClient extends TemplateClient {
  constructor(private readonly cache: SESTemplateCache) {
    super()
  }

  /**
   * Generate email content from a template retrieved from an SES cache.
   * @param templateName
   * @param templateValues
   * @returns { Promise<EmailContent> } The promise object containing the email content.
   */
  public async createEmailFromTemplate<TValues>(
    templateName: string,
    templateValues: TValues,
  ): Promise<EmailContent> {
    const template = await this.cache.get(templateName)

    return this.assignTemplateValues(template, templateValues)
  }

  private assignTemplateValues<TValues>(
    template: Template,
    values: TValues,
  ): EmailContent {
    const templateParts = {
      html: template.html,
      text: template.text,
      subject: template.subject,
    }

    return Object.keys(templateParts).reduce(
      (email: EmailContent, emailPartKey: string) => {
        const templateKey = emailPartKey as keyof Template

        if (!template[templateKey]) {
          return email
        }

        const templateData = SESTemplateClient.replaceTemplateValues(
          template[templateKey] as string,
          values,
        )

        return {
          ...email,
          [emailPartKey]: templateData,
        }
      },
      {} as EmailContent,
    )
  }
}

export default SESTemplateClient
