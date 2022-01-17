import ErrorBase from '../ErrorBase'

class NoEmailBodyError extends ErrorBase {
  public constructor() {
    super()

    this.message = 'Email must contain an html or a text part.'
  }
}

export default NoEmailBodyError
