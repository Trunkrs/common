import InternalServerError from '../http/InternalServerError'

class NoEventHandlerSetError extends InternalServerError {
  public constructor() {
    super()

    this.message = 'No event handler was set for the current method'
  }
}

export default NoEventHandlerSetError
