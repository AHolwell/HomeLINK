import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  PutCommandInput,
  PutCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Util } from "@homelink/core/util";
import { createDevice } from "@homelink/core/devices";
import { parseRegisterRequest } from "@homelink/core/parsing";
import { RegisterRequest } from "@homelink/core/parsing/schema/requestBodies";
import {
  InternalError,
  InternalErrors,
  ValidationError,
  ValidationErrors,
} from "@homelink/core/errors";
import { Device } from "@homelink/core/devices/schema/Device";

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
  // Make safe the user input
  const registerRequest: RegisterRequest = parseRegisterRequest(event);

  // Construct the device object
  const device: Device = createDevice(registerRequest);

  // Put it in the table
  const params: PutCommandInput = {
    TableName: Resource.Devices.name,
    Item: device,
    ConditionExpression: "attribute_not_exists(deviceId)",
  };

  try {
    const result: PutCommandOutput = await dynamoDb.send(
      new PutCommand(params),
    );
  } catch (error: any) {
    if (error?.message === "The conditional request failed")
      throw new ValidationError(ValidationErrors.ItemAlreadyExists);
    throw new InternalError(
      error?.message ?? InternalErrors.DynamoCommandFailed,
    );
  }

  // Return the device details if successful
  return JSON.stringify(device);
});
