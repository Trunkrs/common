import HttpMethod from '../../../models/enum/HttpMethod'

import HttpControllerFactory from '../HttpControllerFactory'

const httpGet =
  (route: string): MethodDecorator =>
  (target, propertyKey) => {
    HttpControllerFactory.registerAction(
      target.constructor,
      propertyKey,
      HttpMethod.Get,
      route,
    )
  }

export default httpGet
