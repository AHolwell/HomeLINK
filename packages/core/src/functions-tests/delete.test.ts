import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { main } from "@homelink/functions/src/delete";
import { mockClient } from "aws-sdk-client-mock";
import { toHaveReceivedCommandWith } from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";

expect.extend({ toHaveReceivedCommandWith });

const client = mockClient(DynamoDBDocumentClient);

vi.mock("@homelink/core/parsing", () => ({
  parseGenericRequest: vi.fn().mockReturnValue({
    userId: "user-123",
    deviceId: "1234",
  }),
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

    client.on(DeleteCommand).resolves({
      Attributes: { deviceId: "1234", userId: "user-123" },
    });

    //Act
    const response = await main(event, {} as Context);

    //Assert
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

  it("should return 404 if item not found", async () => {
    // Arrange
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

    client.on(DeleteCommand).resolves({
      Attributes: undefined,
    });

    // Act
    const response = await main(event, {} as Context);

    // Assert
    expect(response).toEqual({
      body: '{"error":"No device found with given ID"}',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 404,
    });
  });
});
