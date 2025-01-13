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

// If I had to parse more than two bodies I would create a generic to do it that is passed the schema
// However as there are only two of these needed I think its a lot more readable to be explicit here

// TODO More spceific internal errors

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

export const parseListRequest = (event: APIGatewayProxyEvent): ListRequest => {
  const parseResult = listRequestSchema.safeParse({
    userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
  });

  if (!parseResult.success)
    throw new InternalError(InternalErrors.ParsingError);

  return parseResult.data;
};

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
