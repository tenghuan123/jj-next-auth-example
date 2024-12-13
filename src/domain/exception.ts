export class Exception extends Error {
  response: any;
  code: string;
  message: string;
  constructor(code: string, message: string, response?: any) {
    super(message);
    this.code = code;
    this.message = message;
    this.response = response;
  }
}

export class UnauthorizedException extends Exception {
  constructor(message: string, response: any) {
    super("UNAUTHORIZED", message, response);
  }
}
