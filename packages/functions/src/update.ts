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
import { constructDeviceUpdateExpressions } from "@homelink/core/devices";
import { DeviceUpdate } from "@homelink/core/schema/Device";

// Set up client outside handler for persistance between warm invocations
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/**
 * Update endpoint lambda handler
 *
 * Accepts a stringified body JSON of the fields the user is updating
 * eg.'{"colour": "red", "intensity": 70}'
 *
 * @param {APIGatewayProxyEvent} event the API Gateway Event
 * @returns true when the item has been updated
 */
export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  // Get the current entry details

  //Validate + sanitise user input
  const genericRequest: GenericRequest = parseGenericRequest(event);

  //Construct command
  const getParams: GetCommandInput = {
    TableName: Resource.Devices.name,

    Key: {
      userId: genericRequest.userId,
      deviceId: genericRequest.deviceId,
    },
  };

  //Execute command
  const getResult = await dynamoDb.send(new GetCommand(getParams));

  //Check database response
  if (!getResult.Item) {
    throw new ValidationError(
      ValidationErrors.ItemNotFound,
      StatusCode.NotFound,
    );
  }

  if (!getResult.Item?.deviceCategory) {
    throw new InternalError(InternalErrors.DeviceCategoryNotFound);
  }

  // Update the entry details as requested

  //Validate + sanitise user input - depends on device catefory
  const deviceUpdate: DeviceUpdate = parseUpdateRequest(
    event,
    getResult.Item.deviceCategory,
  );

  //Construct command
  const { updateExpression, expressionAttributeValues } =
    constructDeviceUpdateExpressions(deviceUpdate);

  const updateParams: UpdateCommandInput = {
    TableName: Resource.Devices.name,
    Key: {
      userId: genericRequest.userId,
      deviceId: genericRequest.deviceId,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  //Execute command
  await dynamoDb.send(new UpdateCommand(updateParams));

  //Return response
  return JSON.stringify({ status: true });
});
