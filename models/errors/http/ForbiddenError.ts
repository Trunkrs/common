import HTTPError from './HTTPError'

class ForbiddenError extends HTTPError {
  constructor() {
    super(403)

    this.name = 'ForbiddenError'
    Error.captureStackTrace(this)
  }
}

export default ForbiddenError
