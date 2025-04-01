class BaseError extends Error {
  constructor(message, args) {
    super(message, args);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class InternalServerError extends BaseError {
  constructor({ cause, statusCode }) {
    super("Unexpected Error", {
      cause,
    });

    this.name = "InternalServerError";
    this.action = "Get in touch with the support";
    this.statusCode = statusCode || 500;
  }
}

export class ServiceError extends BaseError {
  constructor({ cause, message }) {
    super(message || "Service not available at the moment", {
      cause,
    });

    this.name = "ServiceError";
    this.action = "Try again later";
    this.statusCode = 503;
  }
}

export class ValidationError extends BaseError {
  constructor({ cause, message, action }) {
    super(message || "Invalid input values", {
      cause,
    });

    this.name = "ValidationError";
    this.action = action || "Check the input values";
    this.statusCode = 400;
  }
}

export class MethodNotAllowedError extends BaseError {
  constructor() {
    super("Method not allowed for this resource");

    this.name = "MethodNotAllowedError";
    this.action = "Check the API documentation";
    this.statusCode = 405;
  }
}

export class NotFoundError extends BaseError {
  constructor({ cause, message, action }) {
    super(message || "Resource not found", { cause });

    this.name = "NotFoundError";
    this.action = action || "Check if the resource exists";
    this.statusCode = 404;
  }
}
