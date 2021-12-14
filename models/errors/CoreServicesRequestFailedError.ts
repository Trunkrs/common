class CoreServicesRequestFailedError extends Error {
  public constructor(
    coreServiceStackTrace?: string,
    coreServiceMessage?: string,
  ) {
    super()

    this.message = `message from core services: "${coreServiceMessage}". \n stack trace from core services: "${coreServiceStackTrace}"`
  }
}

export default CoreServicesRequestFailedError
