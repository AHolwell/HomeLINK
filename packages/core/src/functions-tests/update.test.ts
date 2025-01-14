import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { main } from "@homelink/functions/src/update";
import { mockClient } from "aws-sdk-client-mock";
import {
  toHaveReceivedCommand,
  toHaveReceivedCommandWith,
} from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";
import { InternalErrors, ValidationError, ValidationErrors } from "../errors";

expect.extend({ toHaveReceivedCommandWith, toHaveReceivedCommand });
const client = mockClient(DynamoDBDocumentClient);

client.on(GetCommand).resolves({
  Item: {
    userId: "user-123",
    deviceId: "1234",
    deviceCategory: "MyCategory",
  },
});

vi.mock("@homelink/core/input-validation", () => ({
  validateId: vi.fn().mockReturnValue("1234"),
}));

vi.mock("@homelink/core/devices", () => ({
  constructDeviceUpdateExpressions: vi.fn().mockImplementation(() => {
    const updateExpression = "myUpdateExpression";
    const expressionAttributeValues = { ":key1": "value1" };
    return { updateExpression, expressionAttributeValues };
  }),
}));

vi.mock("@homelink/core/parsing", () => ({
  parseGenericRequest: vi.fn().mockReturnValue({
    userId: "user-123",
    deviceId: "1234",
  }),
  parseUpdateRequest: vi.fn().mockReturnValue({
    fieldToUpdate: "valueToUpdate",
  }),
}));

describe("update lambda", () => {
  it("happy path", async () => {
    // Arrange
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: "1234",
      },
      body: JSON.stringify({
        fieldToUpdate: "valueToUpdate",
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

    // Act
    const response = await main(event, {} as Context);

    // Assert
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
      body: '{"status":true}',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    });
  });

  it("returns 404 Not Found when the item does not exist", async () => {
    // Arrange
    client.on(GetCommand).resolves({ Item: undefined });

    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: "1234",
      },
      body: JSON.stringify({
        fieldToUpdate: "valueToUpdate",
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

    // Act
    const response = await main(event, {} as Context);

    // Assert
    expect(response).toEqual({
      body: `{"error":"${ValidationErrors.ItemNotFound}"}`,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 404,
    });
  });

  it("returns 500 Internal Server Error when deviceCategory is missing", async () => {
    // Arrange
    client.on(GetCommand).resolves({
      Item: {
        userId: "user-123",
        deviceId: "1234",
        // Missing deviceCategory
      },
    });

    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: "1234",
      },
      body: JSON.stringify({
        fieldToUpdate: "valueToUpdate",
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

    // Act
    const response = await main(event, {} as Context);

    // Assert
    expect(response).toEqual({
      body: `{"error":"${InternalErrors.DeviceCategoryNotFound}"}`,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 500,
    });
  });
});
