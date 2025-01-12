import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Util } from "@homelink/core/util";
import { createDevice } from "@homelink/core/devices";
import { Device } from "@homelink/core/devices/types";

// Set up client outside handler for persistance between warm invocations
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/**
 * Register endpoint lambda handler
 *
 * Accepts a body with an object containing the modelType and optional deviceName
 *
 * @param event the API Gateway Event
 * @returns the full details of the registered item
 */
export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  const device: Device = createDevice(event);
  const params: PutCommandInput = {
    TableName: Resource.Devices.name,
    Item: {
      ...device,
    },
  };

  await dynamoDb.send(new PutCommand(params));

  return JSON.stringify(params.Item);
});
