import ParamSource from '../../../models/enum/ParamSource'

import HttpControllerFactory from '../HttpControllerFactory'

const fromBody =
  (paramKey?: string): ParameterDecorator =>
  (target, propertyKey) => {
    HttpControllerFactory.registerActionParameter(
      target.constructor,
      propertyKey,
      ParamSource.Body,
      paramKey,
    )
  }

export default fromBody
