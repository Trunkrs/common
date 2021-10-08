import QueryableDataStorage from './QueryableDataStorage'
import { PrimaryKey } from '../utils'

interface DataStorage<TEntity> extends QueryableDataStorage<TEntity> {
  /**
   * Gets a single instance of TEntity through a primary/composed key.
   * Can return null.
   * @template TKey, TEntity
   * @param {TKey} key some type of primary/composed key through which an entity can be found.
   * @returns {TEntity | null} The entity or null
   */
  get(key: PrimaryKey<TEntity>): Promise<TEntity | null>

  /**
   * Performs multiple get requests at the same time through the primary keys provided.
   * @template TEntity
   * @param {PrimaryKey<TEntity>[]} keys. An array of primary keys through which the required entities can be found.
   * @returns {TEntity[]} An array of TEntity
   */
  batchGet(keys: PrimaryKey<TEntity>[]): Promise<TEntity[]>

  /**
   * Delete multiple entities from the database in one go.
   * @template TEntity
   * @param {Partial<TEntity>[]} entities The Primary/Composed key pairs through which multiple entities are to be removed.
   * @returns {Promise<void>}
   */
  batchRemove(entities: Partial<TEntity>[]): Promise<void>

  /**
   * Saved multiple entities to the database in one go.
   * @template TEntity
   * @param {TEntity[]} entities The entities that are to be saved to the database
   * @returns {Promise<TEntity[]>} The entities that were saved to the database
   */
  batchSave(entities: TEntity[]): Promise<TEntity[]>

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

export default DataStorage
