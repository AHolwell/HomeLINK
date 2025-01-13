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
  InternalErrors,
  StatusCode,
  ValidationError,
  ValidationErrors,
} from "@homelink/core/errors";
import {
  parseGenericRequest,
  parseUpdateRequest,
} from "@homelink/core/parsing";
import { GenericRequest } from "@homelink/core/parsing/schema/requestBodies";
import { DeviceUpdate } from "@homelink/core/devices/schema/Device";

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
  const genericRequest: GenericRequest = parseGenericRequest(event);

  // Get the current entry.
  const getParams: GetCommandInput = {
    TableName: Resource.Devices.name,

    Key: {
      userId: genericRequest.userId,
      deviceId: genericRequest.deviceId,
    },
  };

  const getResult = await dynamoDb.send(new GetCommand(getParams));

  if (!getResult.Item) {
    throw new ValidationError(
      ValidationErrors.ItemNotFound,
      StatusCode.NotFound,
    );
  }

  if (!getResult.Item?.deviceCategory) {
    throw new InternalError(InternalErrors.DeviceCategoryNotFound);
  }

  const deviceUpdate: DeviceUpdate = parseUpdateRequest(
    event,
    getResult.Item.deviceCategory,
  );

  // Update the item with new values
  const { updateExpression, expressionAttributeValues } =
    Util.constructUpdateExpressions(deviceUpdate);

  const updateParams: UpdateCommandInput = {
    TableName: Resource.Devices.name,
    Key: {
      userId: genericRequest.userId,
      deviceId: genericRequest.deviceId,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  await dynamoDb.send(new UpdateCommand(updateParams));

  return JSON.stringify({ status: true });
});
