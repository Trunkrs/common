import HTTPError from './HTTPError'

class BadRequestError extends HTTPError {
  constructor() {
    super(400)
  }
}

export default BadRequestError
