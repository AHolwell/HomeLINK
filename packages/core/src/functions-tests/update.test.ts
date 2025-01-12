import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { validateId } from "@homelink/core/input-vaidation";
import { main } from "@homelink/functions/src/update";
import { mockClient } from "aws-sdk-client-mock";
import {
  toHaveReceivedCommand,
  toHaveReceivedCommandWith,
} from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";

expect.extend({ toHaveReceivedCommandWith, toHaveReceivedCommand });
const client = mockClient(DynamoDBDocumentClient);
client.on(GetCommand).resolves({
  Item: {
    userId: "user-123",
    deviceId: "1234",
    deviceCategory: "MyCategory",
  },
});

vi.mock("@homelink/core/errors/errors", () => ({}));

vi.mock("@homelink/core/input-vaidation", () => ({
  validateId: vi.fn().mockReturnValue("1234"),
}));

vi.mock("@homelink/core/devices", () => ({
  constructUpdateExpressions: vi.fn().mockImplementation(() => {
    const updateExpression = "myUpdateExpression";
    const expressionAttributeValues = { ":key1": "value1" };
    return { updateExpression, expressionAttributeValues };
  }),
  getUpdatableFields: vi.fn().mockReturnValue(["", ""]),
}));

describe("get lambda", () => {
  it("happy path", async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: "1234",
      },
      body: JSON.stringify({
        fieldtoUpdate: "update",
      }),
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

    expect(client).toHaveReceivedCommandWith(UpdateCommand, {
      TableName: Resource.Devices.name,
      Key: {
        userId: "user-123",
        deviceId: "1234",
      },
      UpdateExpression: "myUpdateExpression",
      ExpressionAttributeValues: { ":key1": "value1" },
    });

    expect(response).toEqual({
      body: '{\"status\":true}',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    });
  });
});
