#### Register a device

```
npx aws-api-gateway-cli-test \
  --username='26021244-1081-70b8-8b4a-1428e02f5789' \
  --password='<PASSWORD>' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='e3v17bmfascm2uja498pjrfg1' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:8592e0b9-3b7c-4564-ba15-4bf19d1665b2' \
  --invoke-url='https://dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices' \
  --method='POST' \
  --body='{"modelType": "LED", "deviceName": "MyLED"}' 
```