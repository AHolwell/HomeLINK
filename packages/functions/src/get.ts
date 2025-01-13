import { Resource } from "sst";
import { Util } from "@homelink/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  DynamoDBDocumentClient,
  GetCommandInput,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import {
  StatusCode,
  ValidationError,
  ValidationErrors,
} from "@homelink/core/errors";
import { GenericRequest } from "@homelink/core/parsing/schema/requestBodies";
import { parseGenericRequest } from "@homelink/core/parsing";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/**
 * Get endpoint lambda handler
 *
 * Pulls the Id from the routing, and attempts to retireve that item, and present details to user
 *
 * @param event the API Gateway Event
 * @returns the full item object
 */
export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  const genericRequest: GenericRequest = parseGenericRequest(event);

  const params: GetCommandInput = {
    TableName: Resource.Devices.name,
    Key: {
      userId: genericRequest.userId,
      deviceId: genericRequest.deviceId,
    },
  };

  const result: GetCommandOutput = await dynamoDb.send(new GetCommand(params));

  if (!result.Item) {
    throw new ValidationError(
      ValidationErrors.ItemNotFound,
      StatusCode.NotFound,
    );
  }

  return JSON.stringify(result.Item);
});
