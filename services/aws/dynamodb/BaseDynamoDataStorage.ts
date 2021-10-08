import { DynamoDB } from 'aws-sdk'

abstract class BaseDynamoDataStorage<TEntity> {
  protected abstract readonly keys: Array<keyof TEntity>

  protected readonly documentClient: DynamoDB.DocumentClient

  protected constructor(protected readonly tableName: string) {
    this.documentClient = new DynamoDB.DocumentClient()
  }

  protected getKeyPairFromModel(model: TEntity): Partial<TEntity> {
    const keyDictionary: Partial<TEntity> = {}

    this.keys.forEach((key) => {
      keyDictionary[key] = model[key]
    })

    return keyDictionary
  }
}

export default BaseDynamoDataStorage
