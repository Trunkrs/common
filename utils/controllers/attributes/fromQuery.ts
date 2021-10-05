import ParamSource from '../../../models/enum/ParamSource'

import HttpControllerFactory from '../HttpControllerFactory'

const fromQuery =
  (paramKey: string): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => {
    HttpControllerFactory.registerActionParameter(
      target.constructor,
      propertyKey,
      ParamSource.Query,
      paramKey,
    )
  }

export default fromQuery
