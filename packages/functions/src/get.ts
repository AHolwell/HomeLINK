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
 * Parses the Id from the routing, and attempts to retireve that item, and present details to user
 *
 * @param {APIGatewayProxyEvent} event the API Gateway Event
 * @returns the full item object stringified
 */
export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  //Validate + sanitise user input
  const genericRequest: GenericRequest = parseGenericRequest(event);

  //Construct command
  const params: GetCommandInput = {
    TableName: Resource.Devices.name,
    Key: {
      userId: genericRequest.userId,
      deviceId: genericRequest.deviceId,
    },
  };

  //Execute command
  const result: GetCommandOutput = await dynamoDb.send(new GetCommand(params));

  //Check database response
  if (!result.Item) {
    throw new ValidationError(
      ValidationErrors.ItemNotFound,
      StatusCode.NotFound,
    );
  }

  //Return response
  return JSON.stringify(result.Item);
});
