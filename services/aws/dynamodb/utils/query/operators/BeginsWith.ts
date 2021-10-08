class BeginsWith {
  public constructor(private readonly value: string) {}

  public get attributeValue(): string {
    return this.value
  }

  // eslint-disable-next-line class-methods-use-this
  public render(attributeName: string): string {
    return `begins_with(#${attributeName}, :${attributeName})`
  }

  public static fromValue(value: string): BeginsWith {
    return new BeginsWith(value)
  }
}

export default BeginsWith
