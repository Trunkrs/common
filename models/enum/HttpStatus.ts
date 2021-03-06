enum HttpStatus {
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  MultiStatus = 207,

  MovedPermanently = 301,
  Found = 302,
  NotModified = 304,

  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  TooManyRequests = 429,

  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

export default HttpStatus
