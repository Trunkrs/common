import HTTPError from './HTTPError'

class UnauthorizedError extends HTTPError {
  constructor() {
    super(401)

    this.name = 'UnauthorizedError'
    Error.captureStackTrace(this)
  }
}

export default UnauthorizedError
