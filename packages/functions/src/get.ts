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
import { validateId } from "@homelink/core/input-vaidation";
import { Errors, ValidationError } from "@homelink/core/errors/errors";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
  const id: string = validateId(event?.pathParameters?.id);

  const params: GetCommandInput = {
    TableName: Resource.Devices.name,
    Key: {
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
      deviceId: id,
    },
  };

  const result: GetCommandOutput = await dynamoDb.send(new GetCommand(params));

  if (!result.Item) {
    throw new ValidationError(Errors.ItemNotFound);
  }

  return JSON.stringify(result.Item);
});
