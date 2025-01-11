import { Resource } from "sst";
import { Util } from "@homelink/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  const params = {
    TableName: Resource.Devices.name,

    Key: {
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
      deviceId: event?.pathParameters?.id, // Specified in body of request
    },
  };

  const result = await dynamoDb.send(new GetCommand(params));
  if (!result.Item) {
    throw new Error("Item not found.");
  }

  // Return the retrieved item
  return JSON.stringify(result.Item);
});