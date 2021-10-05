import ServiceProvider from '../service-provider'
import { Constructor, ServiceSymbol } from '../service-provider/typings'

class ControllerFactory {
  static #controllerProvider: ServiceProvider = new ServiceProvider()

  /**
   * Registers the specified provider as the controller provider.
   * @param controllerProvider The provider to serve as the controller provider.
   */
  public static registerProvider(controllerProvider: ServiceProvider): void {
    ControllerFactory.#controllerProvider = new ServiceProvider(
      controllerProvider,
      ControllerFactory.#controllerProvider,
    )
  }

  /**
   * Provides the specified controller instance.
   * @param constructor The controller type or symbol of the controller.
   */
  public static provide<TService>(
    constructor: Constructor<TService> | ServiceSymbol<TService>,
  ): TService {
    return ControllerFactory.#controllerProvider.provide<TService>(constructor)
  }

  /**
   * Check whether a provider has been registered with the factory.
   */
  public static hasProvider(): boolean {
    return ControllerFactory.#controllerProvider.count > 0
  }
}

export default ControllerFactory
