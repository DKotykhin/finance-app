class ApiError extends Error {
  status: number;
  message: string;
  constructor(status: number, message: string) {
    super();
    this.status = status;
    this.message = message;
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }

  static unauthorized(message: string) {
    return new ApiError(401, message);
  }

  static forbidden(message: string) {
    return new ApiError(403, message);
  }

  static notFound(message: string) {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static unprocessableEntity(message: string) {
    return new ApiError(422, message);
  }

  static tooManyRequests(message: string) {
    return new ApiError(429, message);
  }

  static internalError(message: string) {
    return new ApiError(500, message);
  }
}

export { ApiError };
