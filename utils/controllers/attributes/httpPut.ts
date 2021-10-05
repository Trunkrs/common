import HttpMethod from '../../../models/enum/HttpMethod'

import HttpControllerFactory from '../HttpControllerFactory'

const httpPut =
  (route: string): MethodDecorator =>
  (target, propertyKey) => {
    HttpControllerFactory.registerAction(
      target.constructor,
      propertyKey,
      HttpMethod.Put,
      route,
    )
  }

export default httpPut
