import EmailContent from '../../models/email/EmailContent'

abstract class TemplateClient {
  abstract createEmailFromTemplate<TValues>(
    templateName: string,
    templateValues: TValues,
  ): Promise<EmailContent>

  /**
   * Check and replace a template string against a dictionary containing template values.
   * @example
   * values.date = '03-02-2021' replaces {{date}}
   * @param template - The string to replace template values with.
   * @param { TValues } values - The template values.
   * @returns string
   * @template TValues
   */
  protected static replaceTemplateValues<TValues = unknown>(
    template: string,
    values: TValues,
  ): string {
    const expression = /\{\{([a-zA-Z0-9\\-]+)\}\}/g
    return template.replace(
      expression,
      <TKey extends keyof TValues>(match: string, key: TKey) => {
        return String(values[key] || match)
      },
    )
  }
}

export default TemplateClient
