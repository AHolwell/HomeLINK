import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { validateId } from "@homelink/core/input-vaidation";
import { main } from "@homelink/functions/src/get";
import { mockClient } from "aws-sdk-client-mock";
import { toHaveReceivedCommandWith } from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";

expect.extend({ toHaveReceivedCommandWith });
const client = mockClient(DynamoDBDocumentClient);
client.on(GetCommand).resolves({
  Item: {
    userId: "user-123",
    deviceId: "1234",
  },
});

vi.mock("@homelink/core/errors/errors", () => ({}));

vi.mock("@homelink/core/input-vaidation", () => ({
  validateId: vi.fn().mockReturnValue("1234"),
}));

describe("get lambda", () => {
  it("happy path", async () => {
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

    const response = await main(event, {} as Context);

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
