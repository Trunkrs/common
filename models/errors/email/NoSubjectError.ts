import ErrorBase from '../ErrorBase'

class NoSubjectError extends ErrorBase {
  public constructor() {
    super()

    this.message = 'Email must contain a subject.'
  }
}

export default NoSubjectError
