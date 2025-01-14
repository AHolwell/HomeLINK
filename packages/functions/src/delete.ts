import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DeleteCommandInput,
  DeleteCommandOutput,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { Util } from "@homelink/core/util";
import { APIGatewayProxyEvent } from "aws-lambda";
import {
  StatusCode,
  ValidationError,
  ValidationErrors,
} from "@homelink/core/errors";
import { parseGenericRequest } from "@homelink/core/parsing";
import { GenericRequest } from "@homelink/core/parsing/schema/requestBodies";

// Set up client outside handler for persistance between warm invocations
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/**
 * Delete endpoint lambda handler
 *
 * Pulls the Id from the routing, and attempts to delete that item from the table if it exists.
 *
 * Request the return values to confirm the item existed before deletion, without it would return successful
 * if the item never existed - There is an argument for that being desired/acceptable behavior.
 *
 * @param {APIGatewayProxyEvent} event the API Gateway Event
 * @returns true when sucessfull
 */
export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  //Validate + sanitise user input
  const genericRequest: GenericRequest = parseGenericRequest(event);

  //Construct command
  const params: DeleteCommandInput = {
    TableName: Resource.Devices.name,
    Key: {
      userId: genericRequest.userId,
      deviceId: genericRequest.deviceId,
    },
    ReturnValues: "ALL_OLD",
  };

  //Execute command
  const response: DeleteCommandOutput = await dynamoDb.send(
    new DeleteCommand(params),
  );

  //Check database response
  if (!response.Attributes) {
    // There is a small security argument for just returning true if the item never existed
    throw new ValidationError(
      ValidationErrors.ItemNotFound,
      StatusCode.NotFound,
    );
  }

  //Return response
  return JSON.stringify({ status: true });
});
