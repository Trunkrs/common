import ServiceNotFoundError from './ServiceNotFoundError'
import { Lifecycle, Constructor, ServiceSymbol } from './typings'

class ServiceDescriptor<TService = any> {
  private readonly lifeCycle: Lifecycle

  private readonly factory?: () => TService

  private readonly ServiceConstructor: Constructor<TService>

  private instance?: TService

  public constructor(
    serviceConstructor: Constructor<TService> | ServiceSymbol<TService>,
    lifeCycle: Lifecycle,
    factory?: () => TService,
  ) {
    this.ServiceConstructor = serviceConstructor as Constructor<TService>

    this.lifeCycle = lifeCycle
    this.factory = factory
  }

  public getInstance(): TService {
    if (this.instance) {
      return this.instance
    }

    if (!this.factory && !this.ServiceConstructor) {
      throw new ServiceNotFoundError(this.ServiceConstructor)
    }

    const instance = this.factory
      ? this.factory()
      : new this.ServiceConstructor()

    if (this.lifeCycle === Lifecycle.Singleton) {
      this.instance = instance
    }

    return instance
  }
}

export default ServiceDescriptor
