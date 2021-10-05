import ErrorBase from '../ErrorBase'

class NoProviderError extends ErrorBase {
  public constructor() {
    super()

    this.message =
      'No provider has been register. It is required to register a controller service provider.'

    this.name = 'NoProviderError'
  }
}

export default NoProviderError
