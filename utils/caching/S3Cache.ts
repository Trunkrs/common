import { AWSError, S3 } from 'aws-sdk'
import { Metadata } from 'aws-sdk/clients/s3'

import { Serializer } from '../serialization'
import Cache, { CacheItem } from './Cache'

class S3Cache extends Cache {
  private readonly expirationTagName = 'CacheExpiration'

  private readonly s3Client = new S3()

  public constructor(
    private readonly serializer: Serializer,
    private readonly bucketArn: string,
    private readonly keyPrefix: string = 'cached',
    stalenessTimeout = 0,
  ) {
    super(stalenessTimeout)
  }

  private getFullKey(key: string): string {
    return `${this.keyPrefix}/${key}`
  }

  public async hasKey(key: string): Promise<boolean> {
    try {
      const meta = await this.s3Client
        .headObject({
          Bucket: this.bucketArn,
          Key: this.getFullKey(key),
        })
        .promise()

      console.log(JSON.stringify(meta.Metadata, null, 2))

      const { [this.expirationTagName]: expiration } = meta.Metadata as Metadata
      return this.isValidItem({
        expiration: new Date(expiration),
      } as CacheItem)
    } catch (error) {
      const s3Error = error as AWSError
      if (s3Error.statusCode === 404) {
        return false
      }

      throw error
    }
  }

  public async add<TValue>(key: string, value: TValue): Promise<void> {
    const cacheItem = this.createItem(value)

    await this.s3Client
      .putObject({
        Bucket: this.bucketArn,
        Key: this.getFullKey(key),
        Body: this.serializer.serialize(value, 'string'),
        Metadata: {
          [this.expirationTagName]: String(Number(cacheItem.expiration)),
        },
      })
      .promise()
  }

  public async get<TValue>(key: string): Promise<TValue | null> {
    const isValid = await this.hasKey(key)
    if (!isValid) {
      return null
    }

    const object = await this.s3Client
      .getObject({
        Bucket: this.bucketArn,
        Key: this.getFullKey(key),
      })
      .promise()

    return this.serializer.deserialize<TValue>(object.Body as Buffer)
  }

  public async getOrAdd<TValue>(
    key: string,
    factory: () => Promise<TValue>,
  ): Promise<TValue> {
    const value = await this.get<TValue>(key)
    if (value) {
      return value
    }

    const newValue = await factory()
    await this.add(key, newValue)
    return newValue
  }

  public async remove(key: string): Promise<void> {
    try {
      await this.s3Client
        .deleteObject({
          Bucket: this.bucketArn,
          Key: this.getFullKey(key),
        })
        .promise()
    } catch (error) {
      const s3Error = error as AWSError
      if (s3Error.statusCode !== 404) {
        throw error
      }
    }
  }

  public async clear(): Promise<void> {
    const bucketItems = await this.s3Client
      .listObjectsV2({
        Bucket: this.bucketArn,
      })
      .promise()

    if (!bucketItems.Contents || !bucketItems.Contents.length) {
      return
    }

    await this.s3Client
      .deleteObjects({
        Bucket: this.bucketArn,
        Delete: {
          Objects: bucketItems.Contents.map((bucketObject) => ({
            Key: bucketObject.Key as string,
          })),
        },
      })
      .promise()
  }
}

export default S3Cache
