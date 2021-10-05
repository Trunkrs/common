import * as Joi from 'joi'

import HTTPError from '../http/HTTPError'

class ValidationError extends HTTPError {
  public constructor(private readonly validationError: Joi.ValidationError) {
    super(422)

    this.name = 'ValidationError'
    Error.captureStackTrace(this)
  }

  public getBody(): Record<string, any> | null {
    return this.validationError
  }
}

export default ValidationError
