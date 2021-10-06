export {}

declare global {
  namespace jest {
    interface Matchers<R> {
      toProvideValidDependencies(): R
    }
  }
}
