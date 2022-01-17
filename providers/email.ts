import { RecipientValidationConfig } from '../services/email/EmailClient/models'
import ServiceProvider, { Lifecycle } from '../utils/service-provider'
import { createTransport } from 'nodemailer'
import * as Mail from 'nodemailer/lib/mailer'
import { SES } from 'aws-sdk'
import awsProvider from './aws'
import {
  EmailClient,
  NodemailerEmailClient,
  SESTemplateClient,
  SESTemplateCache
} from '../services/email'
import { Cache, FileCache } from '../utils/caching'
import utilsProvider, { Serializer } from './utils'
import Environment from '../models/enum/Environment'

export interface ConfigureNodemailerClientRequest {
  from: string
  templateCacheMountPath: string
  sesRegion: string
  stage: Environment
  requireBody?: boolean
  requireSubject?: boolean
  sourceArn?: string
  validateRecipientDomains?: RecipientValidationConfig
}

export const NodemailerClient = ServiceProvider.createSymbol<Mail>(
  'NodemailerClient',
)

export const SesNodemailerClient = ServiceProvider.createSymbol<EmailClient>(
  'SesNodemailerClient')

export const TemplateFileCache = ServiceProvider.createSymbol<Cache>('TemplateCache')

export const configureNodemailerClient = (config: ConfigureNodemailerClientRequest): ServiceProvider => {
  const serviceProvider = new ServiceProvider()

  serviceProvider.register(NodemailerClient, Lifecycle.Singleton, () =>
    createTransport({
      SES: awsProvider.provide(SES),
    }),
  )

  serviceProvider.register(
    TemplateFileCache,
    Lifecycle.Singleton,
    () =>
      new FileCache(
        utilsProvider.provide(Serializer),
        7200000,
        null,
        config.templateCacheMountPath,
      ),
  )

  awsProvider.register(SES, Lifecycle.Singleton,
    () =>
      new SES({
        region: config.sesRegion,
      })
  )

  serviceProvider.register(
    SESTemplateCache,
    Lifecycle.Singleton,
    () =>
      new SESTemplateCache(
        awsProvider.provide(SES),
        serviceProvider.provide(TemplateFileCache),
      ),
  )

  serviceProvider.register(
    SESTemplateClient,
    Lifecycle.Singleton,
    () => new SESTemplateClient(serviceProvider.provide(SESTemplateCache))
  )

  serviceProvider.register(
    SesNodemailerClient,
    Lifecycle.Singleton,
    () => new NodemailerEmailClient({
      mailer: serviceProvider.provide(NodemailerClient),
      templateClient: serviceProvider.provide(SESTemplateClient),
      stage: config.stage,
      from: config.from,
      requireBody: config.requireBody || true,
      requireSubject: config.requireSubject || true,
      sourceArn: config.sourceArn,
      validateRecipientDomains: config.validateRecipientDomains
    })
  )

  return serviceProvider
}

