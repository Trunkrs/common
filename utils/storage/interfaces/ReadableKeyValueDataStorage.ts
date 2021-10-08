interface ReadableKeyValueDataStorage <TKey, TEntity> {
  /**
   * Gets a single instance of TEntity through a primary/composed key.
   * Can return null.
   * @template TKey, TEntity
   * @param {TKey} key some type of primary/composed key through which an entity can be found.
   * @returns {TEntity | null} The entity or null
   */
  get(key: TKey): Promise<TEntity | null>
}

export default ReadableKeyValueDataStorage
