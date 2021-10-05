import ParamSource from '../../../models/enum/ParamSource'

import HttpControllerFactory from '../HttpControllerFactory'

const fromContext =
  (paramKey?: string): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => {
    HttpControllerFactory.registerActionParameter(
      target.constructor,
      propertyKey,
      ParamSource.Context,
      paramKey,
    )
  }

export default fromContext
