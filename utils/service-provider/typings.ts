export type Constructor<TConstructor = any> = new (
  ...args: any[]
) => TConstructor

// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
export type ServiceSymbol<TService = any> = symbol

export enum Lifecycle {
  Transient,
  Singleton,
}
