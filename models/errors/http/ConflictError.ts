import { HttpStatus } from '../../enum'

import HttpError from './HTTPError'

class ConflictError extends HttpError {
  public constructor() {
    super(HttpStatus.Conflict)

    this.name = 'ConflictError'
    Error.captureStackTrace(this)
  }
}

export default ConflictError
