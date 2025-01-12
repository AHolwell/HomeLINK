import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  QueryCommand,
  DynamoDBDocumentClient,
  QueryCommandInput,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { Util } from "@homelink/core/util";
import { APIGatewayProxyEvent } from "aws-lambda";

// Set up client outside handler for persistance between warm invocations
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/**
 * List endpoint lambda handler
 *
 * Pulls the Id from the routing, and retireves all devices associated with the user.
 *
 * Warning: There is no pagination/limit.
 *
 * @param event the API Gateway Event
 * @returns an array of all device objects associated with the user
 */
export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  const params: QueryCommandInput = {
    TableName: Resource.Devices.name,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId":
        event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
    },
  };

  const result: QueryCommandOutput = await dynamoDb.send(
    new QueryCommand(params),
  );

  return JSON.stringify(result.Items);
});
