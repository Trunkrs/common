import {
  SESClient,
  GetTemplateCommand,
  Template as SESTemplate,
} from '@aws-sdk/client-ses'

import Template from '../../models/email/Template'
import EmailContent from '../../models/email/EmailContent'
import TemplateClient from './TemplateClient'
import { Cache } from '../../utils/caching'
import TemplateNotFoundError from '../../models/errors/email/TemplateNotFoundError'

class SESTemplateClient extends TemplateClient {
  constructor(
    private readonly sesClient: SESClient,
    private readonly cache: Cache,
  ) {
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
    const template = await this.getTemplate(templateName)

    return this.assignTemplateValues(template, templateValues)
  }

  /**
   * Retrieves a template from the cache. If the cache does not have the template, attempts to retrieve
   * the template from SES and stores it in the cache.
   * @param { string } templateName - The template to fetch
   * @returns { Promise<Template> } The promise object containing the specified template.
   * @throws { TemplateNotFoundError } - For when a template could not be found.
   */
  public async getTemplate(templateName: string): Promise<Template> {
    const template = await this.cache.get<Template>(templateName)

    return template || this.moveSesTemplateToCache(templateName)
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

  private async moveSesTemplateToCache(
    templateName: string,
  ): Promise<Template> {
    const command = new GetTemplateCommand({
      TemplateName: templateName,
    })

    const { Template: sesTemplate } = await this.sesClient.send(command)

    if (!sesTemplate) {
      throw new TemplateNotFoundError(templateName)
    }

    const template = SESTemplateClient.sesTemplateToTemplate(sesTemplate)

    const { name } = template
    await this.cache.add<Template>(name, template)

    return template
  }

  private static sesTemplateToTemplate(sesTemplate: SESTemplate): Template {
    return {
      name: sesTemplate.TemplateName as string,
      subject: sesTemplate.SubjectPart,
      text: sesTemplate.TextPart,
      html: sesTemplate.HtmlPart,
    }
  }
}

export default SESTemplateClient
