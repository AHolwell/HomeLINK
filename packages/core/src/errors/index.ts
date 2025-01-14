import { ZodError } from "zod";

/**
 * Extention of error type to support error messages for validation failures
 */
export class ValidationError extends Error {
  statusCode: number;
  name: string = "ValidationError";

  constructor(message: string, statusCode: number = StatusCode.BadRequest) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Extention of error type to support error messages for internal errors
 */
export class InternalError extends Error {
  statusCode: number;
  name: string = "InternalError";

  constructor(
    message: string,
    statusCode: number = StatusCode.InternalServerError,
  ) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Possible validation errors
 */
export enum ValidationErrors {
  NoBody = "Request body is missing or empty",
  InvalidJson = "Invalid JSON in request body",
  ItemNotFound = "No device found with given ID",
  ItemAlreadyExists = "An item with the provided device id already exists",
}

/**
 * Possible internal errors
 */
export enum InternalErrors {
  Generic = "Internal server error",
  DeviceIncorrectlyConstructed = "The device does not satisfy the base device schema",
  ParsingError = "Request parsing failed",
  DynamoCommandFailed = "The dynamo command failed without an error message",
  DeviceCategoryNotFound = "Device does not have a category stored",
}
/**
 * StatusCode enum
 */
export enum StatusCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  Conflict = 409,
  InternalServerError = 500,
}

/**
 * Formats a ZodError into a readable string message.
 *
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

  // Iterate through each issue in the Zod error, apply boiler plate formatting
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
