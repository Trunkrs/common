import HttpMethod from '../../../models/enum/HttpMethod'

import HttpControllerFactory from '../HttpControllerFactory'

const httpDelete =
  (route: string): MethodDecorator =>
  (target, propertyKey) => {
    HttpControllerFactory.registerAction(
      target.constructor,
      propertyKey,
      HttpMethod.Delete,
      route,
    )
  }

export default httpDelete
