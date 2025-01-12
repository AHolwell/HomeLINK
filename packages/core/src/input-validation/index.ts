import { APIGatewayProxyEvent } from "aws-lambda";
import { Errors, missingFieldError, ValidationError } from "../errors";
import { validate as isValidUUID } from "uuid";

export type RegisterEventBody = {
  deviceName?: string;
  modelType: string;
};

/**
 * Performs validation and parsing of  the register event body
 *
 * @param event is the event object passed through to the register lambda
 * @returns the parsed and validated body from the event
 */
export const validateRegisterBody = (
  event: APIGatewayProxyEvent,
): RegisterEventBody => {
  if (!event?.body || event.body.trim() === "") {
    throw new ValidationError(Errors.NoBody);
  }

  let body: Partial<RegisterEventBody>;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    throw new ValidationError(Errors.InvalidJson);
  }

  if (!body.modelType) {
    throw new ValidationError(missingFieldError("modelType"));
  }

  return body as RegisterEventBody;
};

/**
 * Validates that the Id given is a uuid string
 *
 * @param id the id taken from the route
 * @returns the id, having passed validation and type refined to string
 */
export const validateId = (id: string | undefined): string => {
  if (!id) {
    //This should be inaccessable code due to the routing requiring an ID to even get to the lambda
    //However it makes the typescript compiler happy
    throw new ValidationError(Errors.MissingId);
  }
  if (!isValidUUID(id)) {
    throw new ValidationError(Errors.InvalidId);
  }
  return id;
};

type KeyValidationMap = {
  [key: string]: (value: any) => boolean;
};

/**
 *Maps the updateable fields to a validation function for the value.
 */
export const validationFunctions: KeyValidationMap = {
  deviceName: (value) => typeof value === "string",
  isPowered: (value) => typeof value === "boolean",
  colour: (value) => ["Red", "Yellow", "White", "Green"].includes(value),
  intensity: (value) => typeof value === "number" && 0 <= value && 100 >= value,
  alarmThreshold: (value) => typeof value === "number" && 0 < value,
};
