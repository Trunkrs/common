interface WriteableDataStorage <TEntity> {
  /**
   * Deletes the given entity from the database through their primary/composed key (TKey).
   * @template TEntity
   * @param {Partial<TEntity>} entity The entity to be deleted.
   * @returns {Promise<void>}
   */
  remove(entity: Partial<TEntity>): Promise<void>

  /**
   * Saves a new entity to the database.
   * @template TEntity
   * @param {TEntity} entity The entity to be saved to the database
   * @returns {TEntity} The saved entity
   */
  save(entity: TEntity): Promise<TEntity> 
}

export default WriteableDataStorage
