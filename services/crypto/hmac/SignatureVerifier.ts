export interface SignatureVerifier<TToBeVerified> {
  verify(toBeVerified: TToBeVerified, signature: string): boolean
}
