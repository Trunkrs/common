import ParamSource from '../../../models/enum/ParamSource'

import HttpControllerFactory from '../HttpControllerFactory'

const fromRoute =
  (paramKey: string): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => {
    HttpControllerFactory.registerActionParameter(
      target.constructor,
      propertyKey,
      ParamSource.Route,
      paramKey,
    )
  }

export default fromRoute
