import { api } from "./api";

const region = aws.getRegionOutput().name;

// Set up user pool
export const userPool = new sst.aws.CognitoUserPool("UserPool", {
  usernames: ["email"],
});

export const userPoolClient = userPool.addClient("UserPoolClient");

// Set up identity pool, connected to user pool and allowing API access
export const identityPool = new sst.aws.CognitoIdentityPool("IdentityPool", {
  userPools: [
    {
      userPool: userPool.id,
      client: userPoolClient.id,
    },
  ],
  permissions: {
    authenticated: [
      // Allow the users to access the defined api gateway only
      {
        actions: ["execute-api:*"],
        resources: [
          $concat(
            "arn:aws:execute-api:",
            region,
            ":",
            aws.getCallerIdentityOutput({}).accountId,
            ":",
            api.nodes.api.id,
            "/*/*/*",
          ),
        ],
      },
    ],
  },
});
