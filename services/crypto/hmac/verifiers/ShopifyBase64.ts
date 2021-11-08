import { parse, stringify } from 'qs'
import { createHmac } from 'crypto'

import { SignatureVerifier } from '../SignatureVerifier'

class ShopifyHexadecimalHMACVerifier implements SignatureVerifier<string> {
  public constructor(private readonly secret: string) {}

  public verify(requestParameterString: string, providedHMAC: string): boolean {
    const parameters = parse(requestParameterString)

    const hasHMAC = !!parameters.hmac
    if (hasHMAC) {
      delete parameters.hmac
    }

    const alphabeticallySortedObject = Object.keys(parameters)
      .sort((a, b) => a.localeCompare(b))
      .reduce((sortedObject, key) => {
        Object.assign(sortedObject, { [key]: parameters[key] })

        return sortedObject
      }, {})

    const sortedQueryString = stringify(alphabeticallySortedObject)

    const verificationString = createHmac('sha256', this.secret)
      .update(sortedQueryString)
      .digest('hex')

    return verificationString === providedHMAC
  }
}

export default ShopifyHexadecimalHMACVerifier
