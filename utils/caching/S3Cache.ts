import {
  NoSuchKey,
  NoSuchBucket,
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { Metadata } from 'aws-sdk/clients/s3'

import { Serializer } from '../serialization'
import Cache, { CacheItem } from './Cache'

class S3Cache extends Cache {
  private readonly expirationTagName = 'cache-expiration'

  private readonly s3Client = new S3Client()

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
      const headObjectCommand = new HeadObjectCommand({
        Bucket: this.bucketArn,
        Key: this.getFullKey(key),
      })

      const meta = await this.s3Client.send(headObjectCommand)
      const { [this.expirationTagName]: expiration } = meta.Metadata as Metadata

      return this.isValidItem({
        expiration: new Date(Number(expiration)),
      } as CacheItem)
    } catch (error) {
      if (error instanceof NoSuchKey || error instanceof NoSuchBucket) {
        return false
      }

      throw error
    }
  }

  public async add<TValue>(key: string, value: TValue): Promise<void> {
    const cacheItem = this.createItem(value)

    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucketArn,
      Key: this.getFullKey(key),
      Body: this.serializer.serialize(value, 'string'),
      Metadata: {
        [this.expirationTagName]: String(Number(cacheItem.expiration)),
      },
    })

    await this.s3Client.send(putObjectCommand)
  }

  public async get<TValue>(key: string): Promise<TValue | null> {
    const isValid = await this.hasKey(key)
    if (!isValid) {
      return null
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucketArn,
      Key: this.getFullKey(key),
    })

    const object = await this.s3Client.send(getObjectCommand)

    if (!object.Body) {
      return null
    }

    return this.serializer.deserialize<TValue>(
      Buffer.from(await object.Body.transformToByteArray()),
    )
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
      const command = new DeleteObjectCommand({
        Bucket: this.bucketArn,
        Key: this.getFullKey(key),
      })

      await this.s3Client.send(command)
    } catch (error) {
      if (error instanceof NoSuchKey || error instanceof NoSuchBucket) {
        throw error
      }
    }
  }

  public async clear(): Promise<void> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketArn,
    })

    const bucketItems = await this.s3Client.send(command)

    if (!bucketItems.Contents || !bucketItems.Contents.length) {
      return
    }

    const deleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: this.bucketArn,
      Delete: {
        Objects: bucketItems.Contents.map((bucketObject) => ({
          Key: bucketObject.Key as string,
        })),
      },
    })

    await this.s3Client.send(deleteObjectsCommand)
  }
}

export default S3Cache
