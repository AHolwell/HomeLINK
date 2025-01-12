import { APIGatewayProxyEvent } from "aws-lambda";
import { deviceFactories, modelTypeToDeviceType } from "./device-factory";
import { categoryUpdatableFields, Device, updateableBaseFields } from "./types";
import { nonUpdatableFieldsError, ValidationError } from "../errors";
import { validateRegisterBody } from "../input-vaidation";

export type EventBody = {
  deviceName?: string;
  modelType: string;
};

export const createDevice = <T extends Device>(
  event: APIGatewayProxyEvent,
): T => {
  const body: EventBody = validateRegisterBody(event);

  const factory = deviceFactories[modelTypeToDeviceType[body.modelType]];
  return factory(event, body) as T;
};

export const getUpdatableFields = (deviceCategory: string) => {
  return [...updateableBaseFields, ...categoryUpdatableFields[deviceCategory]];
};

export const constructUpdateExpressions = (
  allowedFields: string[],
  bodyString: string,
) => {
  const body = JSON.parse(bodyString);
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

  const expressionAttributeValues = Object.fromEntries(
    Object.entries(body).map(([key, value]) => [`:${key}`, value]),
  );
  return { updateExpression, expressionAttributeValues };
};
