import { SES } from 'aws-sdk'
import { Cache } from '../../utils/caching'
import Template from '../../models/email/Template'
import TemplateNotFoundError from '../../models/errors/email/TemplateNotFoundError'

class SESTemplateCache {
  constructor(private readonly sesClient: SES, private readonly cache: Cache) {}

  /**
   * Retrieves a template from the cache. If the cache does not have the template, attempts to retrieve
   * the template from SES and stores it in the cache.
   * @param { string } templateName - The template to fetch
   * @returns { Promise<Template> } The promise object containing the specified template.
   * @throws { TemplateNotFoundError } - For when a template could not be found.
   */
  public async get(templateName: string): Promise<Template> {
    const template = await this.cache.get<Template>(templateName)

    return template || this.moveSesTemplateToCache(templateName)
  }

  private async moveSesTemplateToCache(
    templateName: string,
  ): Promise<Template> {
    const { Template: sesTemplate } = await this.sesClient
      .getTemplate({ TemplateName: templateName })
      .promise()

    if (!sesTemplate) {
      throw new TemplateNotFoundError(templateName)
    }

    const template = SESTemplateCache.sesTemplateToTemplate(sesTemplate)

    const { name } = template
    await this.cache.add<Template>(name, template)

    return template
  }

  private static sesTemplateToTemplate(sesTemplate: SES.Template): Template {
    return {
      name: sesTemplate.TemplateName,
      subject: sesTemplate.SubjectPart,
      text: sesTemplate.TextPart,
      html: sesTemplate.HtmlPart,
    }
  }
}

export default SESTemplateCache
