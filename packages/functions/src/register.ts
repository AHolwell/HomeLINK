import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Util } from "@homelink/core/util";
import { createDevice } from "@homelink/core/devices";
import { Device } from "@homelink/core/devices/types";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
    const device: Device = createDevice(event)

    const params = {
        TableName: Resource.Devices.name,
        Item: {
            ...device
        },
    };

    await dynamoDb.send(new PutCommand(params));

    return JSON.stringify(params.Item);
});