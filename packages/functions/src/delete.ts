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
import { validateId } from "@homelink/core/input-vaidation";
import { Errors, ValidationError } from "@homelink/core/errors";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

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
