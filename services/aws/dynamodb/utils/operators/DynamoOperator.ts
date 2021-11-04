abstract class DynamoOperator<TValue = any> {
  protected constructor(
    /**
     * The value of the attribute housing the operator.
     */
    public readonly attributeValues: TValue[],
  ) {}

  /**
   * Creates a query value attribute name.
   * @param attributeName The external attribute name.
   * @param index The index of the value.
   */
  public makeAttrValueName(attributeName: string, index: number): string {
    return `:${attributeName}_${index}`
  }

  /**
   * Renders the operator into its query string counterpart.
   * @param attributeName The name of the attribute within the datasource.
   */
  public abstract render(attributeName: string): string
}

export default DynamoOperator
