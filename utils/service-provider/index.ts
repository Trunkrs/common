import ServiceDescriptor from './ServiceDescriptor'
import ServiceNotFoundError from './ServiceNotFoundError'
import { ServiceSymbol, Constructor, Lifecycle } from './typings'

export * from './typings'

interface ConsumableProvider {
  store: Map<Constructor | ServiceSymbol, ServiceDescriptor>
}

type ServiceDescriptorValue = [symbol | Constructor, ServiceDescriptor]

class ServiceProvider {
  private readonly store: Map<Constructor | ServiceSymbol, ServiceDescriptor>

  /**
   * Constructs a new service provider instance.
   * @param parentProviders The parent providers of which to copy over the service descriptors.
   */
  public constructor(...parentProviders: ServiceProvider[]) {
    if (parentProviders.length) {
      const descriptors = parentProviders.reduce((array, parentProvider) => {
        const consumable = parentProvider as unknown as ConsumableProvider
        array.push(...consumable.store.entries())

        return array
      }, [] as ServiceDescriptorValue[])

      this.store = new Map<Constructor | ServiceSymbol, ServiceDescriptor>(
        descriptors,
      )
    } else {
      this.store = new Map<Constructor | ServiceSymbol, ServiceDescriptor>()
    }
  }

  /**
   * Creates a new unique service symbol.
   * @param serviceName The name of the service this symbol represents.
   */
  public static createSymbol<TService>(
    serviceName: string,
  ): ServiceSymbol<TService> {
    return Symbol(serviceName)
  }

  /**
   * Registers a new service on this service provider.
   * @param constructor The service or a service symbol to register.
   * @param lifeCycle The lifecycle of the service.
   * @param factory An optional service factory.
   */
  public register<TService>(
    constructor: Constructor<TService> | ServiceSymbol<TService>,
    lifeCycle: Lifecycle,
    factory?: () => TService,
  ): void {
    const descriptor = new ServiceDescriptor(constructor, lifeCycle, factory)

    this.store.set(constructor, descriptor)
  }

  /**
   * Retrieves an instance of the requested service from the service provider.
   * @param constructor The service or service symbol to retrieve.
   * @throws ServiceNotFoundError When the service was not registered with this service provider.
   */
  public provide<TService>(
    constructor: Constructor<TService> | ServiceSymbol<TService>,
  ): TService {
    const descriptor = this.store.get(
      constructor as unknown as Constructor<TService>,
    )

    if (!descriptor) {
      throw new ServiceNotFoundError(constructor)
    }

    return descriptor.getInstance()
  }

  /**
   * The number of registered services of the this service provider.
   */
  public get count(): number {
    return this.store.size
  }
}

export default ServiceProvider
