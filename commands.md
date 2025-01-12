#### Register a device

```
npx aws-api-gateway-cli-test \
  --username='d612c2b4-9031-7099-527f-cc90a787a592' \
  --password='Passw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices' \
  --method='POST' \
  --body='{"modelType": "LED", "deviceName": "MyLED"}'
```

#### List all

```
npx aws-api-gateway-cli-test \
  --username='d612c2b4-9031-7099-527f-cc90a787a592' \
  --password='Passw0rd!' \
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
  --username='d612c2b4-9031-7099-527f-cc90a787a592' \
  --password='Passw0rd!' \
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
  --username='d612c2b4-9031-7099-527f-cc90a787a592' \
  --password='Passw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices/{id}' \
  --method='PUT' \
  --params='{"id": "c7719ac0-d0f9-11ef-8182-1b012c422b70"}' \
  --body='{"colour": "Red"}'
```

#### Remove a device

```
npx aws-api-gateway-cli-test \
  --username='c6c2a2a4-10f1-70e4-a5c5-2fda9f12de29' \
  --password='U1Passw0rd!' \
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
  --username admin@example.com \
  --password Passw0rd!
```

```
aws cognito-idp admin-confirm-sign-up \
  --region eu-west-2 \
  --user-pool-id eu-west-2_wwABMsyxN \
  --username admin@example.com
```

#### Params

IdentityPool: eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75
Region: eu-west-2
UserPoolClientId: 4tjmm1mspujnkgrkcko8nnntiq
UserPoolId: eu-west-2_wwABMsyxN
