import HttpMethod from '../../../models/enum/HttpMethod'

import HttpControllerFactory from '../HttpControllerFactory'

const httpPost =
  (route: string): MethodDecorator =>
  (target, propertyKey) => {
    HttpControllerFactory.registerAction(
      target.constructor,
      propertyKey,
      HttpMethod.Post,
      route,
    )
  }

export default httpPost
