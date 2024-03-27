class apiError extends Error {
  constructor(
    message = "Something went wrong",
    statusCode,
    errors = [],
    stack = ""
  ) {
    super(message);

    this.success = false;
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = null;
    if (stackTrace) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { apiError };
