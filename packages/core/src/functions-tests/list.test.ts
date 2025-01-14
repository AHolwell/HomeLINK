import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { main } from "@homelink/functions/src/list";
import { mockClient } from "aws-sdk-client-mock";
import { toHaveReceivedCommandWith } from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";
import { parseListRequest } from "../parsing";

expect.extend({ toHaveReceivedCommandWith });
const client = mockClient(DynamoDBDocumentClient);

client.on(QueryCommand).resolves({
  Items: [
    {
      userId: "user-123",
      deviceId: "1234",
    },
    {
      userId: "user-123",
      deviceId: "5678",
    },
  ],
});

vi.mock("@homelink/core/parsing", () => ({
  parseListRequest: vi.fn().mockReturnValue({
    userId: "user-123",
  }),
}));

describe("list lambda", () => {
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
    expect(parseListRequest).toHaveBeenCalledWith(event);

    expect(client).toHaveReceivedCommandWith(QueryCommand, {
      TableName: Resource.Devices.name,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": "user-123",
      },
    });

    expect(response).toEqual({
      body: '[{"userId":"user-123","deviceId":"1234"},{"userId":"user-123","deviceId":"5678"}]',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    });
  });
});
