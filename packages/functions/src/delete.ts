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
import { validateId } from "@homelink/core/input-validation";
import { Errors, ValidationError } from "@homelink/core/errors";

// Set up client outside handler for persistance between warm invocations
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/**
 * Delete endpoint lambda handler
 *
 * Pulls the Id from the routing, and attempts to delete that item from the table if it exists and is associated with user.
 *
 * Request the return values to confirm the item existed before deletion, without it would return successful
 * if the item never existed - There is an argument for that being desired/acceptable behavior.
 *
 * @param event the API Gateway Event
 * @returns true when sucessfull
 */
export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  const id: string = validateId(event?.pathParameters?.id);

  const params: DeleteCommandInput = {
    TableName: Resource.Devices.name,
    Key: {
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
      deviceId: id,
    },
    ReturnValues: "ALL_OLD",
  };

  const response: DeleteCommandOutput = await dynamoDb.send(
    new DeleteCommand(params),
  );

  if (!response.Attributes) {
    throw new ValidationError(Errors.ItemNotFound);
  }

  return JSON.stringify({ status: true });
});
