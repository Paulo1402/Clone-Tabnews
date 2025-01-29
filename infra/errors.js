export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Unexpected Error", {
      cause,
    });

    this.name = "InternalServerError";
    this.action = "Get in touch with the support";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}
