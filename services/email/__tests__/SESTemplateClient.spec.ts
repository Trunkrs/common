import { name, company } from 'faker'
import { SES } from 'aws-sdk'
import { SESTemplateClient } from '..'
import { Cache } from '../../../utils/caching'

const createMockCache = () => ({
  get: jest.fn(),
  add: jest.fn(),
})

const createMockSES = () => ({
  getTemplate: jest.fn(),
})

describe('SESTemplateClient', () => {
  let mockCache: ReturnType<typeof createMockCache>
  let mockSES: ReturnType<typeof createMockSES>
  let sut: SESTemplateClient

  describe('createEmailFromTemplate', () => {
    mockCache = createMockCache()
    const templateName = 'The template name'
    const sesTemplate = {
      Template: {
        TemplateName: templateName,
        SubjectPart: 'An email subject from {{name}}',
        HtmlPart:
          '<html><body> An email body from {{name}} of {{company}} </body></html>',
      },
    }

    const templateValues = {
      name: name.firstName(),
      company: company.companyName(),
    }

    const expected = {
      subject: `An email subject from ${templateValues.name}`,
      html: `<html><body> An email body from ${templateValues.name} of ${templateValues.company} </body></html>`,
    }

    it('Should create valid email content from an SES template', async () => {
      mockSES = createMockSES()
      mockSES.getTemplate.mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue(sesTemplate),
      }))

      sut = new SESTemplateClient(
        mockSES as unknown as SES,
        mockCache as unknown as Cache,
      )

      const email = await sut.createEmailFromTemplate(
        templateName,
        templateValues,
      )

      expect(email).toEqual(expected)
    })

    it('Should create valid email content from a template retrieved from the cache', async () => {
      const template = {
        name: templateName,
        subject: 'An email subject from {{name}}',
        html: '<html><body> An email body from {{name}} of {{company}} </body></html>',
      }

      mockCache.get.mockResolvedValueOnce(template)

      const email = await sut.createEmailFromTemplate(
        templateName,
        templateValues,
      )

      expect(email).toEqual(expected)
    })
  })
})
