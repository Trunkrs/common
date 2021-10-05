import HTTPError from './HTTPError'

class InternalServerError extends HTTPError {
  constructor() {
    super(500)

    this.name = 'InternalServerError'
    Error.captureStackTrace(this)
  }
}

export default InternalServerError
