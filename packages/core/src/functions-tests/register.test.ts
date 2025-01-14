import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { main } from "@homelink/functions/src/register";
import { mockClient } from "aws-sdk-client-mock";
import { toHaveReceivedCommandWith } from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";
import { ValidationErrors } from "../errors";

expect.extend({ toHaveReceivedCommandWith });
const client = mockClient(DynamoDBDocumentClient);

client.on(PutCommand).resolves({});

vi.mock("@homelink/core/devices", () => ({
  createDevice: vi.fn().mockReturnValue({
    modelType: "MyModel",
    deviceName: "myDeviceName",
    deviceCategory: "myCategory",
    deviceId: "1234",
  }),
}));

vi.mock("@homelink/core/parsing", () => ({
  parseRegisterRequest: vi.fn().mockReturnValue({
    modelType: "MyModel",
    deviceName: "myDeviceName",
    deviceCategory: "myCategory",
  }),
}));

describe("register lambda", () => {
  it("happy path", async () => {
    // Arrange
    const event: APIGatewayProxyEvent = {
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
    expect(client).toHaveReceivedCommandWith(PutCommand, {
      TableName: Resource.Devices.name,
      Item: {
        modelType: "MyModel",
        deviceName: "myDeviceName",
        deviceCategory: "myCategory",
        deviceId: "1234",
      },
      ConditionExpression: "attribute_not_exists(deviceId)",
    });

    expect(response).toEqual({
      body: '{"modelType":"MyModel","deviceName":"myDeviceName","deviceCategory":"myCategory","deviceId":"1234"}',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    });
  });

  it("returns 409 Conflict when item already exists", async () => {
    // Arrange
    client.on(PutCommand).rejects(new Error("The conditional request failed"));

    const event: APIGatewayProxyEvent = {
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
      body: `{"error":"${ValidationErrors.ItemAlreadyExists}"}`,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 409,
    });

    expect(client).toHaveReceivedCommandWith(PutCommand, {
      TableName: Resource.Devices.name,
      Item: {
        modelType: "MyModel",
        deviceName: "myDeviceName",
        deviceCategory: "myCategory",
        deviceId: "1234",
      },
      ConditionExpression: "attribute_not_exists(deviceId)",
    });
  });

  it("returns 500 Internal Server Error for unexpected errors", async () => {
    // Arrange
    client.on(PutCommand).rejects(new Error("Some other DynamoDB error"));

    const event: APIGatewayProxyEvent = {
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
      body: '{"error":"Some other DynamoDB error"}',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 500,
    });

    expect(client).toHaveReceivedCommandWith(PutCommand, {
      TableName: Resource.Devices.name,
      Item: {
        modelType: "MyModel",
        deviceName: "myDeviceName",
        deviceCategory: "myCategory",
        deviceId: "1234",
      },
      ConditionExpression: "attribute_not_exists(deviceId)",
    });
  });
});
