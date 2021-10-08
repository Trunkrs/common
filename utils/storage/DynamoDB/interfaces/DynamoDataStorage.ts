import QueryableDataStorage from '../../interfaces/QueryableDataStorage'
import ReadableKeyValueDataStorage from '../../interfaces/ReadableKeyValueDataStorage'
import { PrimaryKey } from '../utils'
import WriteableDataStorage from '../../interfaces/WriteableDataStorage'

interface DynamoDataStorage<TEntity>
  extends QueryableDataStorage<TEntity>,
    ReadableKeyValueDataStorage<PrimaryKey<TEntity>, TEntity>,
    WriteableDataStorage<TEntity> {
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
}

export default DynamoDataStorage
