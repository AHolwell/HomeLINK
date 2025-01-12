import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { validateId } from "../input-validation";
import { main } from "@homelink/functions/src/delete";
import { mockClient } from "aws-sdk-client-mock";
import { toHaveReceivedCommandWith } from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";

//Mock dynamo and other imports
expect.extend({ toHaveReceivedCommandWith });
const client = mockClient(DynamoDBDocumentClient);

client.on(DeleteCommand).resolves({
  Attributes: {},
});

vi.mock("@homelink/core/input-validation", () => ({
  validateId: vi.fn().mockReturnValue("1234"),
}));

describe("delete lambda", () => {
  it("happy path", async () => {
    //Arrange
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: "1234",
      },
      requestContext: {
        authorizer: {
          iam: {
            cognitoIdentity: {
              identityId: "user-123",
            },
          },
        },
      },
    } as unknown as APIGatewayProxyEvent;

    //Act
    const response = await main(event, {} as Context);

    //Assert
    expect(validateId).toHaveBeenCalledWith("1234");

    expect(client).toHaveReceivedCommandWith(DeleteCommand, {
      TableName: Resource.Devices.name,
      Key: {
        userId: "user-123",
        deviceId: "1234",
      },
    });

    expect(response).toEqual({
      body: '{"status":true}',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    });
  });
});
