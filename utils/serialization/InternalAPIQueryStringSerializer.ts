import { parse as parseQueryString, stringify } from 'qs'

import Serializer from './Serializer'

class InternalAPIQueryStringSerializer implements Serializer {
  private stringifyArrays(
    obj: Record<string, unknown>,
  ): Record<string, unknown> {
    const keys = Object.keys(obj)

    return keys.reduce((returnedObject, key) => {
      if (Array.isArray(obj[key])) {
        return {
          ...returnedObject,
          [key]: (obj[key] as any[]).map(String).join('|'),
        }
      }

      if (typeof obj[key] === 'object') {
        const processedObject = this.stringifyArrays(
          obj[key] as Record<string, unknown>,
        )
        return {
          ...returnedObject,
          [key]: processedObject,
        }
      }

      return {
        ...returnedObject,
        [key]: obj[key],
      }
    }, {})
  }

  public deserialize<TOutput>(serialized: Buffer | string): TOutput {
    const stringValue =
      typeof serialized !== 'string' ? serialized.toString('utf8') : serialized

    return parseQueryString(stringValue) as unknown as TOutput
  }

  public serialize<TObject>(object: TObject, output: 'string'): string

  public serialize<TObject>(object: TObject, output: 'buffer'): Buffer

  public serialize<TObject>(
    object: TObject,
    output: 'string' | 'buffer',
  ): string | Buffer {
    const processedObject = this.stringifyArrays(
      object as Record<string, unknown>,
    )

    const serialized = stringify(processedObject, {
      encode: true,
      skipNulls: true,
    })

    return output === 'buffer' ? Buffer.from(serialized, 'utf8') : serialized
  }
}

export default InternalAPIQueryStringSerializer
