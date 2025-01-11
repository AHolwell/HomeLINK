#### Register a device

```
npx aws-api-gateway-cli-test \
  --username='26021244-1081-70b8-8b4a-1428e02f5789' \
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
  --username='26021244-1081-70b8-8b4a-1428e02f5789' \
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
  --username='26021244-1081-70b8-8b4a-1428e02f5789' \
  --password='Passw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices/{id}' \
  --method='GET' \
  --params='{"id": "c3c6b940-d04b-11ef-a6c9-33e15598bf23"}' 
```

#### Update a device

```
npx aws-api-gateway-cli-test \
  --username='26021244-1081-70b8-8b4a-1428e02f5789' \
  --password='Passw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices/{id}' \
  --method='PUT' \
  --params='{"id": "1f4e9620-d05b-11ef-b87a-675b849f1ef0"}' \
  --body='{"colour": "Red"}' 
```

#### Remove a device

```
npx aws-api-gateway-cli-test \
  --username='26021244-1081-70b8-8b4a-1428e02f5789' \
  --password='Passw0rd!' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='4tjmm1mspujnkgrkcko8nnntiq' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:2cc84db5-a550-4e47-a4fe-d26c7d01cd75' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices/{id}' \
  --method='DELETE' \
  --params='{"id": "d4635920-d04b-11ef-a6c9-33e15598bf23"}' 
```
