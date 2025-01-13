// Create the DynamoDB table
export const table = new sst.aws.Dynamo("Devices", {
  // Not all fields need to be defined here, just the ones used for indexing
  fields: {
    userId: "string",
    deviceId: "string",
  },
  // Use the userID and device IDs (unique) for indexing
  primaryIndex: { hashKey: "userId", rangeKey: "deviceId" },
});
//TODO have a better answer for what hashkey and rangekey are and why I used them how I did
