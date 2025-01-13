import { ZodError } from "zod";

// Extend Error to Validation error for code readability and statusCode support
export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = StatusCode.BadRequest) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class InternalError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode: number = StatusCode.InternalServerError,
  ) {
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
  `A value was not provided for: ${field}`;

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

export enum ValidationErrors {
  NoBody = "Request body is missing or empty",
  InvalidJson = "Invalid JSON in request body",
  MissingId = "The device ID was not provided",
  ItemNotFound = "No device found with given ID",
  ItemAlreadyExists = "An item with the provided device id already exists",
}

export enum InternalErrors {
  Generic = "Internal server error",
  DeviceIncorrectlyConstructed = "The device does not satisfy the base device schema",
  ParsingError = "Request parsing failed",
  DynamoCommandFailed = "The dynamo command failed without an error message",
  DeviceCategoryNotFound = "Device does not have a category stored",
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

/**
 * Formats a ZodError into a readable string message.
 * @param {ZodError} error - The ZodError object.
 * @returns {string} - Formatted error message.
 */
export const formatZodError = (error: ZodError) => {
  const missingFields: string[] = [];
  const invalidFields: string[] = [];
  const tooBigFields: string[] = [];
  const tooSmallFields: string[] = [];
  const customErrors: string[] = [];
  const invalidEnumFields: string[] = [];

  // Iterate through each issue in the Zod error
  error.errors.forEach((issue) => {
    const fieldPath = issue.path.join(".");

    switch (issue.code) {
      case "invalid_type":
        if (issue.received === "undefined") {
          // Missing field case
          missingFields.push(fieldPath);
        } else {
          // Invalid type case
          invalidFields.push(
            `${fieldPath} (expected ${issue.expected}, received ${issue.received})`,
          );
        }
        break;

      case "too_big":
        tooBigFields.push(
          `${fieldPath} (maximum ${issue.maximum} ${issue.type}${
            issue.inclusive ? " inclusive" : ""
          })`,
        );
        break;

      case "too_small":
        tooSmallFields.push(
          `${fieldPath} (minimum ${issue.minimum} ${issue.type}${
            issue.inclusive ? " inclusive" : ""
          })`,
        );
        break;

      case "invalid_enum_value":
        invalidEnumFields.push(
          `${fieldPath} (received "${issue.received}", expected one of: ${issue.options.join(
            ", ",
          )})`,
        );
        break;

      case "custom":
        customErrors.push(`${fieldPath} (custom error: ${issue.message})`);
        break;

      default:
        // For any other error types, fallback to including the message
        invalidFields.push(`${fieldPath} (error: ${issue.message})`);
        break;
    }
  });

  // Generate error message
  const missingMessage =
    missingFields.length > 0
      ? `Missing required field(s): ${missingFields.join(", ")}`
      : null;
  const invalidMessage =
    invalidFields.length > 0
      ? `Invalid type or other error on the following field(s): ${invalidFields.join(
          ", ",
        )}`
      : null;
  const tooBigMessage =
    tooBigFields.length > 0
      ? `Field(s) exceeding maximum size: ${tooBigFields.join(", ")}`
      : null;
  const tooSmallMessage =
    tooSmallFields.length > 0
      ? `Field(s) below minimum size: ${tooSmallFields.join(", ")}`
      : null;
  const enumMessage =
    invalidEnumFields.length > 0
      ? `Invalid value for enum field(s): ${invalidEnumFields.join(", ")}`
      : null;
  const customMessage =
    customErrors.length > 0
      ? `Custom error(s): ${customErrors.join(", ")}`
      : null;

  return [
    missingMessage,
    invalidMessage,
    tooBigMessage,
    tooSmallMessage,
    enumMessage,
    customMessage,
  ]
    .filter(Boolean)
    .join(". ");
};
