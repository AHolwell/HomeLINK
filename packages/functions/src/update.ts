import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient, GetCommand, GetCommandInput, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@homelink/core/util";
import { APIGatewayProxyEvent } from "aws-lambda";
import { constructUpdateExpressions, getUpdatableFields } from "@homelink/core/devices";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// I want to allow the update body to allow any combination of valid fields for that device
// {
//      fieldToBeUpdated: fieldToBeUpdated
// }
// get the current device type
// so I need to validate the fields to be updated exist on the type of device that it is
// contstruct the update request

export const main = Util.handler(async (event: APIGatewayProxyEvent) => {
    if (!event.body) {
        throw new Error('No body was passed')
    }


    // Get the current entry.
    const getParams: GetCommandInput = {
        TableName: Resource.Devices.name,

        Key: {
            userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
            deviceId: event?.pathParameters?.id, // Specified in body of request
        },
    };

    const getResult = await dynamoDb.send(new GetCommand(getParams));
    if (!getResult.Item) {
        throw new Error("Item not found.");
    }
    
    if (!getResult.Item?.deviceCategory) {
        throw new Error("Device category not found")
    }
    
    const allowedFields = getUpdatableFields(getResult.Item?.deviceCategory)

    const {updateExpression, expressionAttributeValues} = constructUpdateExpressions(allowedFields, event.body)
    
    const updateParams: UpdateCommandInput = {
        TableName: Resource.Devices.name,
        Key: {
            // The attributes of the item to be created
            userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
            deviceId: event?.pathParameters?.id,
        },
        // 'UpdateExpression' defines the attributes to be updated
        // 'ExpressionAttributeValues' defines the value in the update expression
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues
    };

    await dynamoDb.send(new UpdateCommand(updateParams));

    return JSON.stringify({ status: true });
});