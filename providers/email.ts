import { createTransport } from 'nodemailer'
import * as Mail from 'nodemailer/lib/mailer'
import * as SES from '@aws-sdk/client-ses'

import ServiceProvider, { Lifecycle } from '../utils/service-provider'
import { RecipientValidationConfig } from '../services/email/EmailClient/models'
import awsProvider from './aws'
import {
  EmailClient,
  NodemailerEmailClient,
  SESTemplateClient,
} from '../services/email'
import { Cache, FileCache } from '../utils/caching'
import utilsProvider, { Serializer } from './utils'
import Environment from '../models/enum/Environment'

export interface ConfigureEmailClientsRequest {
  from: string
  templateCacheMountPath: string
  sesRegion: string
  stage: Environment
  requireBody?: boolean
  requireSubject?: boolean
  sourceArn?: string
  validateRecipientDomains?: RecipientValidationConfig
}

export const NodemailerClient =
  ServiceProvider.createSymbol<Mail>('NodemailerClient')

export const SesNodemailerClient = ServiceProvider.createSymbol<EmailClient>(
  'SesNodemailerClient',
)

export const SESClientSymbol =
  ServiceProvider.createSymbol<SES.SESClient>('SESClient')
export const TemplateFileCache =
  ServiceProvider.createSymbol<Cache>('TemplateCache')

export const configureEmailClients = (
  request: ConfigureEmailClientsRequest,
): ServiceProvider => {
  const serviceProvider = new ServiceProvider()

  serviceProvider.register(NodemailerClient, Lifecycle.Singleton, () =>
    createTransport({
      SES: { ses: serviceProvider.provide(SESClientSymbol), aws: SES },
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
        request.templateCacheMountPath,
      ),
  )

  awsProvider.register(
    SESClientSymbol,
    Lifecycle.Singleton,
    () =>
      new SES.SES({
        region: request.sesRegion,
      }),
  )

  serviceProvider.register(
    SESTemplateClient,
    Lifecycle.Singleton,
    () =>
      new SESTemplateClient(
        awsProvider.provide(SESClientSymbol),
        serviceProvider.provide(TemplateFileCache),
      ),
  )

  serviceProvider.register(
    SesNodemailerClient,
    Lifecycle.Singleton,
    () =>
      new NodemailerEmailClient({
        mailer: serviceProvider.provide(NodemailerClient),
        templateClient: serviceProvider.provide(SESTemplateClient),
        stage: request.stage,
        from: request.from,
        requireBody: request.requireBody || true,
        requireSubject: request.requireSubject || true,
        sourceArn: request.sourceArn,
        validateRecipientDomains: request.validateRecipientDomains,
      }),
  )

  return serviceProvider
}
