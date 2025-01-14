## Setting up a user

#### Add a user

```
aws cognito-idp sign-up \
  --region <REGION> \
  --client-id <USERPOOL_CLIENT_ID> \
  --username user@example.com \
  --password <PASSWORD>
  --profile <PROFILE_NAME>
```

Take note of the userSub value returned, it is the username needed by the GatewayTestCLI

#### Confirm their password

```
aws cognito-idp admin-confirm-sign-up \
  --region <REGION> \
  --user-pool-id <USERPOOL_ID> \
  --username user@example.com \
  --profile <PROFILE_NAME>
```

## Using the API

As they API is fronted by cognito, api testing is done most easily via [AWS API Gateway Test CLI](https://github.com/AnomalyInnovations/aws-api-gateway-cli-test)

The variables needed will be output to the console in dev mode or after deploy.

Refer to the schema at `./packages/core/src/parsing/schema/requestBodies.ts` for allowed bodies.

For allowed update fields refer to the schema in `./packages/core/src/schema`

#### Register a device

```
npx aws-api-gateway-cli-test \
  --username='<USER_NAME>' \
  --password='<PASSWORD>' \
  --user-pool-id='<USERPOOL_ID>' \
  --app-client-id='<USERPOOL_CLIENT_ID>' \
  --cognito-region='<REGION>' \
  --identity-pool-id='<IDENTITY_POOL>' \
  --invoke-url='https://api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='<REGION>' \
  --path-template='/devices' \
  --method='POST' \
  --body='{"deviceCategory": "CarbonMonitor", "deviceName": "MyCOMonitor - Optional", "deviceId": "123"}'
```

#### List all devices

```
npx aws-api-gateway-cli-test \
  --username='<USER_NAME>' \
  --password='<PASSWORD>' \
  --user-pool-id='<USERPOOL_ID>' \
  --app-client-id='<USERPOOL_CLIENT_ID>' \
  --cognito-region='<REGION>' \
  --identity-pool-id='<IDENTITY_POOL>' \
  --invoke-url='https://api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='<REGION>' \
  --path-template='/devices' \
  --method='GET'
```

#### Get a device

```
npx aws-api-gateway-cli-test \
  --username='<USER_NAME>' \
  --password='<PASSWORD>' \
  --user-pool-id='<USERPOOL_ID>' \
  --app-client-id='<USERPOOL_CLIENT_ID>' \
  --cognito-region='<REGION>' \
  --identity-pool-id='<IDENTITY_POOL>' \
  --invoke-url='https://api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='<REGION>' \
  --path-template='/devices/{id}' \
  --method='GET' \
  --params='{"id": "123"}'
```

#### Update a device

```
npx aws-api-gateway-cli-test \
  --username='<USER_NAME>' \
  --password='<PASSWORD>' \
  --user-pool-id='<USERPOOL_ID>' \
  --app-client-id='<USERPOOL_CLIENT_ID>' \
  --cognito-region='<REGION>' \
  --identity-pool-id='<IDENTITY_POOL>' \
  --invoke-url='https://api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='<REGION>' \
  --path-template='/devices/{id}' \
  --method='PUT' \
  --params='{"id": "123"}' \
  --body='{"alarmThreshold": 800}'
```

#### Remove a device

```
npx aws-api-gateway-cli-test \
  --username='<USER_NAME>' \
  --password='<PASSWORD>' \
  --user-pool-id='<USERPOOL_ID>' \
  --app-client-id='<USERPOOL_CLIENT_ID>' \
  --cognito-region='<REGION>' \
  --identity-pool-id='<IDENTITY_POOL>' \
  --invoke-url='https://api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='<REGION>' \
  --path-template='/devices/{id}' \
  --method='DELETE' \
  --params='{"id": "123"}'
```
