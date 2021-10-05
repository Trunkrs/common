import Serializer from './Serializer'

class JSONSerializer implements Serializer {
  public deserialize<TOutput>(serialized: Buffer | string): TOutput {
    const stringValue =
      typeof serialized !== 'string' ? serialized.toString('utf8') : serialized

    return JSON.parse(stringValue)
  }

  public serialize<TObject>(object: TObject, output: 'string'): string

  public serialize<TObject>(object: TObject, output: 'buffer'): Buffer

  public serialize<TObject>(
    object: TObject,
    output: 'string' | 'buffer',
  ): string | Buffer {
    const serialized = JSON.stringify(object)

    return output === 'buffer' ? Buffer.from(serialized, 'utf8') : serialized
  }
}

export default JSONSerializer
