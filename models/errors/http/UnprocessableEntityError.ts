import HTTPError from './HTTPError'

class UnprocessableEntityError extends HTTPError {
  constructor() {
    super(422)

    this.name = 'UnprocessableEntityError'
    Error.captureStackTrace(this)
  }
}

export default UnprocessableEntityError
