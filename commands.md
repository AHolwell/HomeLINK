#### Register a device

```
npx aws-api-gateway-cli-test \
  --username='76c20204-c031-7093-4bb3-d0db792a361b' \
  --password='MyNewPassw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices' \
  --method='POST' \
  --body='{"deviceCategory": "CarbonMonitor", "deviceName": "MyCOMon", "deviceId": "123"}'
```

#### List all

```
npx aws-api-gateway-cli-test \
  --username='76c20204-c031-7093-4bb3-d0db792a361b' \
  --password='MyNewPassw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices' \
  --method='GET'
```

#### Get a device

```
npx aws-api-gateway-cli-test \
  --username='c67292f4-80d1-7005-14d7-63dd1b4056ab' \
  --password='MyNewPassw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices/{id}' \
  --method='GET' \
  --params='{"id": "d06838a0-d0f9-11ef-8182-1b012c422b70"}'
```

#### Update a device

```
npx aws-api-gateway-cli-test \
  --username='76c20204-c031-7093-4bb3-d0db792a361b' \
  --password='MyNewPassw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices/{id}' \
  --method='PUT' \
  --params='{"id": "1"}' \
  --body='{"colour": "Red"}'
```

#### Remove a device

```
npx aws-api-gateway-cli-test \
  --username='c67292f4-80d1-7005-14d7-63dd1b4056ab' \
  --password='MyNewPassw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices/{id}' \
  --method='DELETE' \
  --params='{"id": "d969e820-d0fb-11ef-bd87-cf2f6d616065"}'
```

#### Add a user

```
aws cognito-idp sign-up \
  --region eu-west-2 \
  --client-id 4tjmm1mspujnkgrkcko8nnntiq \
  --username user1@example.com \
  --password MyNewPassw0rd!
```

```
aws cognito-idp admin-confirm-sign-up \
  --region eu-west-2 \
  --user-pool-id eu-west-2_wwABMsyxN \
  --username user1@example.com \
  --profile adminProfile
```

#### Params

IdentityPool: eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75
Region: eu-west-2
UserPoolClientId: 4tjmm1mspujnkgrkcko8nnntiq
UserPoolId: eu-west-2_wwABMsyxN

#### Users

76c20204-c031-7093-4bb3-d0db792a361b
c67292f4-80d1-7005-14d7-63dd1b4056ab
