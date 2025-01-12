// Supporting functionality for the lambdas regarding device management

import { APIGatewayProxyEvent } from "aws-lambda";
import { deviceFactories, modelTypeToDeviceType } from "./device-factory";
import { categoryUpdatableFields, Device, updateableBaseFields } from "./types";
import {
  invalidValuesError,
  nonUpdatableFieldsError,
  ValidationError,
} from "../errors";
import {
  RegisterEventBody,
  validateRegisterBody,
  validationFunctions,
} from "../input-validation";

/**
 * Validates the request body and then constructs the device details
 *to be put into the dynamo table via a device factory mapped from the device category
 *
 * @param event The API gateway event passed into the register lambda
 * @returns A Device object ready to be put into the devices dynamoDB table
 */
export const createDevice = <T extends Device>(
  event: APIGatewayProxyEvent,
): T => {
  const body: RegisterEventBody = validateRegisterBody(event);

  const factory = deviceFactories[modelTypeToDeviceType[body.modelType]];
  return factory(event, body) as T;
};

/**
 * Looks up the fields a given category lets you update using a hard coded maping stored in ./types.ts
 *
 * @param deviceCategory The device category ie. "Light" or "CarbonMonitor in this case"
 * @returns Array of fields that we'll allow the user to update the table values for.
 */
export const getUpdatableFields = (deviceCategory: string) => {
  return [...updateableBaseFields, ...categoryUpdatableFields[deviceCategory]];
};

/**
 * Validates the request body, then constructs the updateExpression expressionAttributeValues
 * needed to update the fields in the dynamodb table through the UpdateCommand
 *
 * @param allowedFields The fields that we will allow them to update, given by getUpdatableFields
 * @param bodyString The body of the event passed to the update lambda
 * @returns Deconstructable values of updateExpression and expressionAttributeValues
 */
export const constructUpdateExpressions = (
  allowedFields: string[],
  bodyString: string,
) => {
  const body = JSON.parse(bodyString);

  // Validate the fields are allowed to be updated and construct update expression
  let updateExpression: string = "SET ";
  let invalidFields: string[] = [];
  Object.keys(body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updateExpression += `${key} = :${key} `;
    } else {
      invalidFields.push(key);
    }
  });

  if (invalidFields.length > 0) {
    throw new ValidationError(nonUpdatableFieldsError(invalidFields));
  }

  // Validate the values to be updated to and construct expression attribute values object
  let invalidValues: string[] = [];
  Object.entries(body).forEach(([key, value]) => {
    const validationFunc = validationFunctions[key];
    if (!validationFunc(value)) {
      invalidValues.push(`${key}: ${value}`);
    }
  });

  if (invalidValues.length > 0) {
    throw new ValidationError(invalidValuesError(invalidValues));
  }

  const expressionAttributeValues = Object.fromEntries(
    Object.entries(body).map(([key, value]) => [`:${key}`, value]),
  );
  return { updateExpression, expressionAttributeValues };
};
