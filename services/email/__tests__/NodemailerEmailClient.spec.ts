import { name } from 'faker'
import Mail from 'nodemailer/lib/mailer'

import { SESTemplateClient } from '..'
import NodemailerEmailClient, {
  NodemailerConfig,
} from '../NodemailerEmailClient'
import Environment from '../../../models/enum/Environment'
import { RecipientValidationConfig } from '../EmailClient/models'
import InvalidEmailAddressesError from '../../../models/errors/email/InvalidEmailAddressesError'
import EmailValidationError from '../../../models/errors/email/EmailValidationError'

const createMockMailer = () => ({
  sendMail: jest.fn(),
})

const emailContent = {
  subject: 'A subject',
  html: `<html><body>An email from ${name.firstName()} </body></html>`,
}

const createMockSESTemplateClient = () => ({
  createEmailFromTemplate: jest.fn().mockResolvedValue(emailContent),
})

describe('NodemailerEmailClient', () => {
  let mockMailer: ReturnType<typeof createMockMailer>
  let mockSESTemplateClient: ReturnType<typeof createMockSESTemplateClient>
  let sut: NodemailerEmailClient
  let config: NodemailerConfig

  const createConfig = (
    from: string,
    stage: Environment,
    validateRecipientDomains?: RecipientValidationConfig,
  ): NodemailerConfig => {
    mockMailer = createMockMailer()
    mockSESTemplateClient = createMockSESTemplateClient()

    return {
      mailer: mockMailer as unknown as Mail,
      templateClient: mockSESTemplateClient as unknown as SESTemplateClient,
      from,
      stage,
      validateRecipientDomains,
      requireBody: true,
      requireSubject: true,
    }
  }
  describe('sendTemplatedEmail', () => {
    beforeEach(() => {
      config = createConfig('foo@bar.baz', Environment.Dev)

      sut = new NodemailerEmailClient(config)
    })

    it('Should send an email if a recipient validation rule is set but the environment is exempted', async () => {
      config = createConfig('foo@bar.baz', Environment.Prod, {
        allowedDomains: ['bar.baz'],
        disableOnEnvironment: [Environment.Prod],
      })

      sut = new NodemailerEmailClient(config)

      await sut.sendTemplatedEmail({
        to: ['bar@bar.baz'],
        templateName: 'a template',
        templateValues: { name: 'sender' },
      })

      expect(mockMailer.sendMail).toBeCalledTimes(1)
    })

    it('Should throw an error if the email created from the template does not contain neither a subject nor body', async () => {
      const params = {
        to: ['bar@bar.baz'],
        templateName: 'a template',
        templateValues: { name: 'sender' },
      }

      mockSESTemplateClient.createEmailFromTemplate.mockResolvedValueOnce({})
      await expect(async () => sut.sendTemplatedEmail(params)).rejects.toThrow(
        EmailValidationError,
      )

      mockSESTemplateClient.createEmailFromTemplate.mockResolvedValueOnce({
        text: 'A body',
      })
      await expect(async () => sut.sendTemplatedEmail(params)).rejects.toThrow(
        EmailValidationError,
      )
    })

    it('Should throw an error if attempting to send an email from a non-whitelisted domain.', async () => {
      config = createConfig('foo@bar.baz', Environment.Dev, {
        allowedDomains: ['bar.baz'],
      })
      sut = new NodemailerEmailClient(config)

      const params = {
        to: ['bar@forbidden.email'],
        templateName: 'a template',
        templateValues: { name: 'sender' },
      }

      await expect(async () => sut.sendTemplatedEmail(params)).rejects.toThrow(
        InvalidEmailAddressesError,
      )
    })
  })
})
