import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Util } from "@homelink/core/util";
import { APIGatewayProxyEvent } from "aws-lambda";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  const params = {
    TableName: Resource.Devices.name,

    // List all devices associated with user
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
    },
  };

  const result = await dynamoDb.send(new QueryCommand(params));

  // Return the matching list of items in response body
  return JSON.stringify(result.Items);
});