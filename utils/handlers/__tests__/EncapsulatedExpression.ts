import faker from 'faker'

import EncapsulatedExpression from '../EncapsulatedExpression'
import { ExpressionFailedError } from '../../../models/errors/handlers'

describe('EncapsulatedExpression', () => {
  describe('Capturing expressions', () => {
    it('should capture a simple expression', () => {
      const target = { foo: () => 'bar' }
      const subject = new EncapsulatedExpression<typeof target>()

      ;(() => subject.asCapturable().foo)()

      expect(subject.toString()).toBe('foo')
    })

    it('should capture a complex expression', () => {
      const target = { foo: { bar: { baz: () => 1 } } }
      const subject = new EncapsulatedExpression<typeof target>()

      ;(() => subject.asCapturable().foo.bar.baz)()

      expect(subject.toString()).toBe('foo.bar.baz')
    })
  })

  describe('Invoking expressions', () => {
    it('should invoke a simple expression', () => {
      const testValue = faker.random.word()
      const target = { foo: jest.fn((input) => input) }
      const subject = new EncapsulatedExpression<typeof target>()
      ;(() => subject.asCapturable().foo)()

      const result = subject.invoke(target, testValue)

      expect(target.foo).toBeCalledWith(testValue)
      expect(target.foo).toBeCalledTimes(1)
      expect(result).toBe(testValue)
    })

    it('should invoke a complex expression', () => {
      const testValue = faker.random.word()
      const target = { foo: { bar: { baz: jest.fn((inp) => inp) } } }
      const subject = new EncapsulatedExpression<typeof target>()
      ;(() => subject.asCapturable().foo.bar.baz)()

      const result = subject.invoke(target, testValue)

      expect(target.foo.bar.baz).toBeCalledWith(testValue)
      expect(target.foo.bar.baz).toBeCalledTimes(1)
      expect(result).toBe(testValue)
    })

    it('should throw when the expression can not be evaluated', () => {
      const testValue = faker.random.word()
      const target = { foo: { bar: { baz: jest.fn((inp) => inp) } } }
      const invalidTarget: any = { foo: 1 }
      const subject = new EncapsulatedExpression<typeof target>()
      ;(() => subject.asCapturable().foo.bar.baz)()

      expect(() => subject.invoke(invalidTarget, testValue)).toThrow(
        ExpressionFailedError,
      )
    })

    it('should throw when the expression is not callable', () => {
      const testValue = faker.random.word()
      const target = { foo: () => 1 }
      const invalidTarget: any = { foo: 1 }
      const subject = new EncapsulatedExpression<typeof target>()
      ;(() => subject.asCapturable().foo)()

      expect(() => subject.invoke(invalidTarget, testValue)).toThrow(
        ExpressionFailedError,
      )
    })
  })
})
