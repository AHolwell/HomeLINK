export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = StatusCode.BadRequest) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const missingFieldError = (field: string) =>
  `Missing required field: ${field}`;

export const nonUpdatableFieldsError = (fields: string[]) =>
  `You cannot update the following field(s): ${fields.join(", ")}`;

export enum Errors {
  NoBody = "Request body is missing or empty",
  InvalidJson = "Invalid JSON in request body",
  MissingId = "The device ID was not provided",
  InvalidId = "Device ID is not valid UUID",
  ItemNotFound = "No device found with given ID",
}

export enum StatusCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}
