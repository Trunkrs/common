const toProvideValidDependencies = (provider) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let instanceName

  try {
    provider.store.forEach((service) => {
      instanceName = service?.ServiceConstructor?.name || service.ServiceConstructor
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
