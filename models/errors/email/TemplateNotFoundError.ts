import ErrorBase from '../ErrorBase'

class TemplateNotFoundError extends ErrorBase {
  public constructor(identifier: string) {
    super()

    this.message = `The template: ${identifier} could not be found.`
  }
}

export default TemplateNotFoundError
