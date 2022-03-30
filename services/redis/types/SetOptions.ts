import SetCondition from './SetCondition'

interface SetOptions {
  /**
   * Describes the date the item will expire at. After which it will be removed from the Redis Store
   */
  expiresAt?: Date
  /**
   * Sets an item only: if the key is, or is not, already in use.
   */
  setCondition?: SetCondition
}

export default SetOptions
