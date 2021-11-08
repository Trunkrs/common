import { createHmac, Hmac } from 'crypto'

import { SignatureVerifier } from '../SignatureVerifier'

class PandaDocHex implements SignatureVerifier<string> {
  public constructor(private readonly signatureKey: string) {}

  public verify(toBeVerified: string, signature: string): boolean {
    const trustedSignature = createHmac('sha256', this.signatureKey)
      .update(toBeVerified)
      .digest('hex')

    return trustedSignature === signature
  }
}

export default PandaDocHex
