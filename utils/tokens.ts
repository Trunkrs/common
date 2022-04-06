import jwt from 'jsonwebtoken'
import isAfter from 'date-fns/isAfter'
import add from 'date-fns/add'

/**
 * Extracts the token claims from a JWT token.
 * @param token The token to extract claims from.
 */
const extractTokenClaims = (token: string): Record<string, unknown> => {
  const tokenPayload = jwt.decode(token)
  return tokenPayload as Record<string, unknown>
}

/**
 * Extracts the expiration date from the specified JWT token.
 * @param token The JWT token to extract the expiration from.
 */
export const getExpirationDate = (token: string): Date => {
  const { exp } = extractTokenClaims(token)
  const expiryDate = new Date(0)
  expiryDate.setUTCSeconds(exp as number)

  return expiryDate
}

/**
 * Checks whether the token has expired.
 * @param token The JWT to check for expiration.
 */
export const isExpired = (token: string): boolean => {
  const expDate = getExpirationDate(token)
  return isAfter(add(new Date(), { minutes: 1 }), expDate)
}
