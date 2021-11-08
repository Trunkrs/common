import { SignatureVerifier } from './SignatureVerifier'

class SignatureVerificationService<TToBeVerified> {
  public constructor(
    private readonly verifier: SignatureVerifier<TToBeVerified>,
  ) {}

  public verifySignature = (
    toBeVerified: TToBeVerified,
    signature: string,
  ): boolean => {
    return this.verifier.verify(toBeVerified, signature)
  }
}

export default SignatureVerificationService
