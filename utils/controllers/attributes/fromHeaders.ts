import ParamSource from '../../../models/enum/ParamSource'

import HttpControllerFactory from '../HttpControllerFactory'

const fromHeaders =
  (paramKey: string): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => {
    HttpControllerFactory.registerActionParameter(
      target.constructor,
      propertyKey,
      ParamSource.Headers,
      paramKey,
    )
  }

export default fromHeaders
