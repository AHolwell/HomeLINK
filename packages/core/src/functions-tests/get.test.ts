import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { validateId } from "../input-validation";
import { main } from "@homelink/functions/src/get";
import { mockClient } from "aws-sdk-client-mock";
import { toHaveReceivedCommandWith } from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";

//Mock dynamo and other imports
expect.extend({ toHaveReceivedCommandWith });
const client = mockClient(DynamoDBDocumentClient);
client.on(GetCommand).resolves({
  Item: {
    userId: "user-123",
    deviceId: "1234",
  },
});

vi.mock("@homelink/core/input-validation", () => ({
  validateId: vi.fn().mockReturnValue("1234"),
}));

describe("get lambda", () => {
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

    expect(client).toHaveReceivedCommandWith(GetCommand, {
      TableName: Resource.Devices.name,
      Key: {
        userId: "user-123",
        deviceId: "1234",
      },
    });

    expect(response).toEqual({
      body: '{\"userId\":\"user-123\",\"deviceId\":\"1234\"}',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    });
  });
});
