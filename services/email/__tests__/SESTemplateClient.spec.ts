import { name, company } from 'faker'
import { SESTemplateCache, SESTemplateClient } from '..'

const createMockSESTemplateCache = () => ({
  get: jest.fn(),
})
const templateName = 'The template name'
describe('SESTemplateClient', () => {
  let mockSESTemplateCache: ReturnType<typeof createMockSESTemplateCache>
  let sut: SESTemplateClient

  beforeEach(() => {
    mockSESTemplateCache = createMockSESTemplateCache()
    sut = new SESTemplateClient(
      mockSESTemplateCache as unknown as SESTemplateCache,
    )
  })

  describe('createEmailFromTemplate', () => {
    it('Should create valid email content from a template', async () => {
      const template = {
        name: templateName,
        subject: 'An email subject from {{name}}',
        html: '<html><body> An email body from {{name}} of {{company}} </body></html>',
      }
      const templateValues = {
        name: name.firstName(),
        company: company.companyName(),
      }

      mockSESTemplateCache.get.mockResolvedValueOnce(template)

      const email = await sut.createEmailFromTemplate(
        templateName,
        templateValues,
      )

      const expected = {
        subject: `An email subject from ${templateValues.name}`,
        html: `<html><body> An email body from ${templateValues.name} of ${templateValues.company} </body></html>`,
      }

      expect(email).toEqual(expected)
    })
  })
})
