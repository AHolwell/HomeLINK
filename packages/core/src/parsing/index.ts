import { event } from "sst/event";
import {
  formatZodError,
  InternalError,
  InternalErrors,
  ValidationError,
  ValidationErrors,
} from "../errors";
import {
  GenericRequest,
  genericRequestSchema,
  ListRequest,
  listRequestSchema,
  RegisterRequest,
  registerRequestSchema,
} from "./schema/requestBodies";
import { APIGatewayProxyEvent } from "aws-lambda";
import { DeviceUpdate } from "../schema/Device";
import { baseDeviceUpdateSchema, deviceUpdateSchemas } from "../schema";

/**
 * Parses the generic info out of the API event - userId and deviceId
 *
 * @param {APIGatewayProxyEvent} event API Proxy event
 * @returns generic request details - userId and deviceId
 */
export const parseGenericRequest = (
  event: APIGatewayProxyEvent,
): GenericRequest => {
  const parseResult = genericRequestSchema.safeParse({
    deviceId: event.pathParameters?.id,
    userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
  });

  if (!parseResult.success)
    throw new InternalError(InternalErrors.ParsingError);

  return parseResult.data;
};

/**
 * Parses the list request info - just the userId
 *
 * @param {APIGatewayProxyEvent} event API Proxy event
 * @returns user Id
 */
export const parseListRequest = (event: APIGatewayProxyEvent): ListRequest => {
  const parseResult = listRequestSchema.safeParse({
    userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
  });

  if (!parseResult.success)
    throw new InternalError(InternalErrors.ParsingError);

  return parseResult.data;
};

/**
 * Parses the register request info needed for device object construction
 *
 * @param {APIGatewayProxyEvent} event API Proxy event
 * @returns RegisterRequest object
 */
export const parseRegisterRequest = (
  event: APIGatewayProxyEvent,
): RegisterRequest => {
  if (!event?.body) throw new ValidationError(ValidationErrors.NoBody);

  let jsonObject: Object;

  try {
    jsonObject = JSON.parse(event.body);
  } catch (error: any) {
    throw new ValidationError(ValidationErrors.InvalidJson);
  }

  const parseResult = registerRequestSchema.safeParse(jsonObject);

  if (!parseResult.success)
    throw new ValidationError(formatZodError(parseResult.error));

  const registerRequest: RegisterRequest = {
    ...parseResult.data,
    userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
  };

  return registerRequest;
};

/**
 * Parses the update request info needed for device object construction specific to the device category
 *
 * @param {APIGatewayProxyEvent} event API Proxy event
 * @returns device update object
 */
export const parseUpdateRequest = (
  event: APIGatewayProxyEvent,
  deviceCategory: string,
): DeviceUpdate => {
  if (!event?.body) throw new ValidationError(ValidationErrors.NoBody);
  let jsonObject: Object;

  try {
    jsonObject = JSON.parse(event.body);
  } catch (error: any) {
    throw new ValidationError(ValidationErrors.InvalidJson);
  }

  const updateSchema =
    deviceUpdateSchemas[deviceCategory.toLocaleLowerCase()] ||
    baseDeviceUpdateSchema;

  const parseResult = updateSchema.safeParse(jsonObject);

  if (!parseResult.success)
    throw new ValidationError(formatZodError(parseResult.error));

  const deviceUpdate: DeviceUpdate = parseResult.data;
  return deviceUpdate;
};
