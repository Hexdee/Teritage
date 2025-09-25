export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(404, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(400, message);
  }
}
