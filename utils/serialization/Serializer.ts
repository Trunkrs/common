interface Serializer {
  /**
   * Serializes the the input object to the specified output type.
   * @param object The serializable object.
   * @param output The output type
   */
  serialize<TObject = unknown>(object: TObject, output: 'string'): string

  /**
   * Serializes the the input object to the specified output type.
   * @param object The serializable object.
   * @param output The output type
   */
  serialize<TObject = unknown>(object: TObject, output: 'buffer'): Buffer

  /**
   * Deserializes the specified serialized input into the output object.
   * @param serialized The serialized value
   */
  deserialize<TOutput = unknown>(serialized: Buffer | string): TOutput
}

export default Serializer
