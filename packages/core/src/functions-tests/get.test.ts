import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { main } from "@homelink/functions/src/get";
import { mockClient } from "aws-sdk-client-mock";
import { toHaveReceivedCommandWith } from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";
import { parseGenericRequest } from "../parsing";

expect.extend({ toHaveReceivedCommandWith });
const client = mockClient(DynamoDBDocumentClient);

client.on(GetCommand).resolves({
  Item: {
    userId: "user-123",
    deviceId: "1234",
  },
});

vi.mock("@homelink/core/parsing", () => ({
  parseGenericRequest: vi.fn().mockReturnValue({
    userId: "user-123",
    deviceId: "1234",
  }),
}));

describe("get lambda", () => {
  it("happy path", async () => {
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

    // Act
    const response = await main(event, {} as Context);

    // Assert
    expect(parseGenericRequest).toHaveBeenCalledWith(event);

    expect(client).toHaveReceivedCommandWith(GetCommand, {
      TableName: Resource.Devices.name,
      Key: {
        userId: "user-123",
        deviceId: "1234",
      },
    });

    expect(response).toEqual({
      body: '{"userId":"user-123","deviceId":"1234"}',
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

    client.on(GetCommand).resolves({
      Item: undefined,
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
