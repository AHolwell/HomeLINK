import { APIGatewayProxyEvent } from "aws-lambda";
import { Errors, missingFieldError, ValidationError } from "../errors";
import { validate as isValidUUID } from "uuid";

export type EventBody = {
  deviceName?: string;
  modelType: string;
};

export const validateRegisterBody = (
  event: APIGatewayProxyEvent,
): EventBody => {
  if (!event?.body || event.body.trim() === "") {
    throw new ValidationError(Errors.NoBody);
  }

  let body: Partial<EventBody>;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    throw new ValidationError(Errors.InvalidJson);
  }

  if (!body.modelType) {
    throw new ValidationError(missingFieldError("modelType"));
  }

  return body as EventBody;
};

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
