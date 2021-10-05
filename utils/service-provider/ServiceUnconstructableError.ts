import { Constructor, ServiceSymbol } from './typings'
import { ErrorBase } from '../../models/errors'

class ServiceUnconstructableError extends ErrorBase {
  public constructor(constructor: ServiceSymbol | Constructor) {
    super()

    this.message = `Can't construct ${String(
      constructor,
    )} without a valid factory. Please provide one in its provider registration.`
  }
}

export default ServiceUnconstructableError
