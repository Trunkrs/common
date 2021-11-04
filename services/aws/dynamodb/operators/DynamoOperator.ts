abstract class DynamoOperator<TValue = any> {
  protected constructor(
    /**
     * The value of the attribute housing the operator.
     */
    public readonly attributeValues: TValue[],
  ) {}

  /**
   * Renders the operator into its query string counterpart.
   * @param attributeName The name of the attribute within the datasource.
   */
  public abstract render(attributeName: string): string
}

export default DynamoOperator
