import { ErrorBase } from '../../models/errors'

class ServiceNotFoundError extends ErrorBase {
  constructor(service: any) {
    super()

    this.message = `Service: ${service} was not found. Are you sure it's registered with this provider?`
  }
}

export default ServiceNotFoundError
