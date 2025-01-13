import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Util } from "@homelink/core/util";
import { APIGatewayProxyEvent } from "aws-lambda";
import {
  InternalError,
  StatusCode,
  ValidationError,
} from "@homelink/core/errors";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/**
 * Update endpoint lambda handler
 *
 * Accepts a stringified body object of the fields the user is updating
 * eg.{colour: red, intensity: 70}
 *
 * @param event the API Gateway Event
 * @returns true when the item has been updated
 */
export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    // Full validation is done later when constructing the expression, its worth checking for empty body first though to avoid unnecessary table requests
    throw new ValidationError(Errors.NoBody);
  }
  const id: string = validateId(event?.pathParameters?.id);

  // Get the current entry.
  const getParams: GetCommandInput = {
    TableName: Resource.Devices.name,

    Key: {
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
      deviceId: id,
    },
  };

  const getResult = await dynamoDb.send(new GetCommand(getParams));
  if (!getResult.Item) {
    throw new ValidationError(Errors.ItemNotFound, StatusCode.NotFound);
  }

  if (!getResult.Item?.deviceCategory) {
    throw new InternalError(Errors.DeviceCategoryNotFound);
  }

  // Update the item with new values
  const allowedFields = getUpdatableFields(getResult.Item?.deviceCategory);

  // TODO: Also split the validation and construction steps if possible
  // Allow input validation to use functionality from devices, but not the other way around
  // Store schema in devices, input validation can then pull those schema to check the user body is allowed
  // Constructing the update expressions can be a util.
  const { updateExpression, expressionAttributeValues } =
    constructUpdateExpressions(allowedFields, event.body);

  const updateParams: UpdateCommandInput = {
    TableName: Resource.Devices.name,
    Key: {
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
      deviceId: id,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  await dynamoDb.send(new UpdateCommand(updateParams));

  return JSON.stringify({ status: true });
});
