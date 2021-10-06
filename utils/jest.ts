import ServiceProvider, {
  Constructor,
  ServiceSymbol,
} from './service-provider'
import ServiceDescriptor from './service-provider/ServiceDescriptor'

import CustomMatcherResult = jest.CustomMatcherResult

const toProvideValidDependencies = (
  provider: ServiceProvider,
): CustomMatcherResult => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const members = provider.store as Map<
    Constructor | ServiceSymbol,
    ServiceDescriptor
    >

  let instanceName: string

  try {
    members.forEach((service) => {
      instanceName =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        service?.ServiceConstructor?.name ||
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (service.ServiceConstructor as unknown as string)

      service.getInstance()
    })
  } catch (error) {
    return {
      pass: false,
      message: () => `Could not construct ${instanceName}: ${error}`,
    }
  }

  return {
    pass: true,
    message: () => 'Successfully constructed all dependencies',
  }
}

expect.extend({
  toProvideValidDependencies,
})
