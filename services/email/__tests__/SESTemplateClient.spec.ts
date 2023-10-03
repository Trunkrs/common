import { name, company } from 'faker'
import { GetTemplateCommand, SESClient } from '@aws-sdk/client-ses'
import { mockClient } from 'aws-sdk-client-mock'

import { SESTemplateClient } from '..'
import { Cache } from '../../../utils/caching'

function createMockCache() {
  return {
    get: jest.fn(),
    add: jest.fn(),
  }
}

describe('SESTemplateClient', () => {
  let mockCache: ReturnType<typeof createMockCache>
  const mockSES = mockClient(SESClient)
  let sut: SESTemplateClient

  beforeEach(() => {
    mockSES.reset()
    mockCache = createMockCache()
    sut = new SESTemplateClient(
      mockSES as unknown as SESClient,
      mockCache as unknown as Cache,
    )
  })

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
      mockSES.on(GetTemplateCommand).resolves(sesTemplate)

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
