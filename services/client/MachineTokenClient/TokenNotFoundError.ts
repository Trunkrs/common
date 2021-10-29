import ErrorBase from '../../../models/errors/ErrorBase'

class TokenNotFoundError extends ErrorBase {
  constructor() {
    super()

    this.message = `The machine token you are trying to retrieve could not be found. Are you sure it has been set?`
  }
}

export default TokenNotFoundError
