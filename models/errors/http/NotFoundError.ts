import HTTPError from './HTTPError'

class NotFoundError extends HTTPError {
  constructor() {
    super(404)

    this.name = 'NotFoundError'
    Error.captureStackTrace(this)
  }
}

export default NotFoundError
