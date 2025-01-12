// Extend Error to Validation error for code readability and statusCode support
export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = StatusCode.BadRequest) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Constructs an error message telling of a missing field
 *
 * @param field is field found to be missing
 * @returns a constructed error message telling of the missing field
 */
export const missingFieldError = (field: string) =>
  `Missing required field: ${field}`;

/**
 * Constructs an error message telling of fields the user tried to update, but we wont allow
 * ie. any not specifically listed as updatable - so catches any mispelt or just not allowed
 *
 * @param fields is an array of fields the user tried to update, but we wont allow - ie. not specifically listed as updatable
 * @returns an error message telling of fields the user tried to update, but we wont allow
 */
export const nonUpdatableFieldsError = (fields: string[]) =>
  `You cannot update the following field(s): ${fields.join(", ")}`;

/**
 * Constructs an error message telling of fields the user tried to update, but the value is invalid
 *
 * @param fields is an array of fields the user tried to update, but with invalid values
 * @returns an error message telling of fields the user tried to update with thei invalid values
 */
export const invalidValuesError = (fields: string[]) =>
  `The following values are invalid: ${fields.join(", ")}`;

/**
 * Errors enum for DRY (dont repeat yourself) purposes
 */
export enum Errors {
  NoBody = "Request body is missing or empty",
  InvalidJson = "Invalid JSON in request body",
  MissingId = "The device ID was not provided",
  InvalidId = "Device ID is not valid UUID",
  ItemNotFound = "No device found with given ID",
}

/**
 * StatusCode enum for DRY (dont repeat yourself) purposes
 */
export enum StatusCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}
