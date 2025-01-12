import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { main } from "@homelink/functions/src/register";
import { mockClient } from "aws-sdk-client-mock";
import { toHaveReceivedCommandWith } from "aws-sdk-client-mock-vitest";
import { Resource } from "sst";

expect.extend({ toHaveReceivedCommandWith });
const client = mockClient(DynamoDBDocumentClient);
client.on(PutCommand).resolves({});

vi.mock("@homelink/core/devices", () => ({
  createDevice: vi.fn().mockReturnValue({
    modelType: "MyModel",
    deviceName: "myDeviceName",
    deviceCategory: "myCategory",
  }),
}));

describe("list lambda", () => {
  it("happy path", async () => {
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

    const response = await main(event, {} as Context);

    expect(client).toHaveReceivedCommandWith(PutCommand, {
      TableName: Resource.Devices.name,
      Item: {
        modelType: "MyModel",
        deviceName: "myDeviceName",
        deviceCategory: "myCategory",
      },
    });

    expect(response).toEqual({
      body: '{\"modelType\":\"MyModel\",\"deviceName\":\"myDeviceName\",\"deviceCategory\":\"myCategory\"}',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    });
  });
});
