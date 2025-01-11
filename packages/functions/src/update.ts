import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Util } from "@homelink/core/util";
import { APIGatewayProxyEvent } from "aws-lambda";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
    const data = JSON.parse(event.body || "{}");

    const getParams = {
        TableName: Resource.Devices.name,

        Key: {
            userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
            deviceId: event?.pathParameters?.id, // Specified in body of request
        },
    };

    const result = await dynamoDb.send(new GetCommand(getParams));
    if (!result.Item) {
        throw new Error("Item not found.");
    }



    const updateParams = {
        TableName: Resource.Devices.name,
        Key: {
            // The attributes of the item to be created
            userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId, // The id of the author
            deviceId: event?.pathParameters?.id, // The id of the note from the path
        },
        // 'UpdateExpression' defines the attributes to be updated
        // 'ExpressionAttributeValues' defines the value in the update expression
        UpdateExpression: "SET content = :content, attachment = :attachment",
        ExpressionAttributeValues: {
            ":attachment": data.attachment || null,
            ":content": data.content || null,
        },
    };

    await dynamoDb.send(new UpdateCommand(updateParams));

    return JSON.stringify({ status: true });
});