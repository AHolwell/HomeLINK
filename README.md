# HomeLink Interview Task

//TODO last - make index files just the exports.https://basarat.gitbook.io/typescript/main-1/barrel

### Warning!

This project uses the [SST framework](https://sst.dev/).

It will deploy resources to your AWS account, and as such will need an AWS profile with sufficient IAM permissions to provision.

### Hosted Version

I will host the app at:

- API: `api.homelink.nuvolaconsulting.co.uk`

## Get started

1. Configure an AWS profile

```
   $ aws configure sso
```

2. Clone repo and install packages

```
   $ git clone https://github.com/AHolwell/HomeLINK.git
   $ cd HomeLINK
   $ npm install
```

3. In `./sst.config.ts` replace the profile name with the one you set up.

```
   providers: {
      aws: {
         region: "eu-west-2",
         profile: "<YOUR_PROFILE_NAME>"
      }
   }
```

4. In `./infra/api.ts` replace the domain with one you have set up a hosted zone for in route 53 - alternatively remove the line to use an AWS generated domain.

```
domain: $app.stage === "production" ? "api.homelink.<YOUR_DOMAIN>" : undefined,
```

5. You can now get started with SST dev mode to run the lambda functions locally (still deploying the supporting infrastructure)

```
   $ npx sst dev
```

6. Or deploy the api fully

```
   $ npx sst deploy --stage production
```

7. Set up a user (or multiple)

```
   $ aws cognito-idp sign-up \
      --region <COGNITO_REGION> \
      --client-id <USER_POOL_CLIENT_ID> \
      --username user@example.com \
      --password Passw0rd!
      --profile <YOUR_PROFILE_NAME>
```

7. And confirm their password

```
   $ aws cognito-idp admin-confirm-sign-up \
      --region <COGNITO_REGION> \
      --user-pool-id <USER_POOL_ID> \
      --username user@example.com
      --profile <YOUR_PROFILE_NAME>
```

8. To test the endpoints, it is easiest to use [AWS API Gateway Test CLI](https://github.com/AnomalyInnovations/aws-api-gateway-cli-test) to navigate IAM Authorisation

   Please find detailed commands in `./commands.md` and user credentials in the email.

## Usage

The infrastructure is defined in `./infra/`, split into:

- `api.ts` defines the APIGateway resources and routing
- `auth.ts` defines the Cognito resources, a user pool and identity pool
- `storage.ts` defines the DynamoDB table

The code is in `./packages/` is split into:

- `/functions` contains the lambda handlers for each route defined in the API
- `/core` contains supporting logic utilised by the handlers

## Tests

To run the unit tests navigate to `./packages/core`

```
$ cd packages/core
$ npm test
```

Note: The tests are ran via SST scripts, which means you'll need to have configured AWS as described above.

## My Approach

### Assumptions

- Though real time, the data is updated infrequently - ie. we're not streaming real time updates every second, but keeping track of things that change a few times a day.
- To simulate real world, device categories with the same functions -ie lights - could be registered with different models rather than just as 'lights'
- All devices will have a model type, and then an over arching category such as 'Light' which has shared functionality across those models.
- User has AWS CLI and account set up for usage.
- The API will be made available to consumers to interact with directly - custom home set ups for IoT hobbyists + enthusiasts.
  - helpful error messages but no data leaking - a challenge

### Tech

DynamoDB table to store the device information.

- Non-relational allows for devices to have different headers but be stored in the same place
- Key-Value pair is a natural fit for the data - users with different device IDs

Serverless architecture is ideal for the use case of small snippets of code supporting the API, and the infrequent use they'll have.

Cognito to provide handy login functionality to store devices against users, as well as protect me from going broke.

SST to handle IaC + deployment cleanly + quickly for a small project, as well as hopefully eliminate the chance of being hit with a 'it works on my machine' scenario.

Vitest because its packaged with SST

Typescript because typing is cool.

### Design

It's a fairly standard serverless design. API gateway routing to lambdas to handle the functionality. The lambdas validate the request, interact with the DynamoDB and confirm the results. Cognito is used to provide authentification functionality so other people cant see my devices (or spam my endpoints).

The lambda code itself focuses on the interaction with the databases, any further functionality/logic has been abstracted into the devices core package. There is also a Lambda Handler wrapper in Utils to cleanly manage error handling, headers and CORs.

The code has been structured in such a way that it should be easy to scale up the devices covered. Though as touched on in `./packages/core/src/devices/helpers.ts` and `./packages/core/src/devices/device-factory.ts`, the devices being hardcoded isnt ideal, a more realistic solution would be an external database of supported devices and their information to lookup. Schema changes are scary and we want them to be away from the application.

Devices is designed as if it was an external package that this app relys on, so schemas arent so readily available and changable by someone who isnt sure what they are doing - maintain a trustable source of truth //TODO

Would be good to: Fill test gaps - lambda unhappy paths and functional testing (mock databases)

Somewhat strange that we're recieving the unique device id into the register endpoint rather than generating one on register - who is the user and why would they have this?

Register needs to infer properties about the device the user hasnt given, we dont want them to have to specifically register the starting colour etc - too much friction.

I'll allow any device category, though support certain ones with extra functionality - "Light" and "CarbonMonitor"

### Most interesting challenge

Chose not to allow you to set the updatable fields during registration for useflow simplicity - low friction on registering device, then allowing user to explore customisation.

Having the update endpoint allow any valid combination of fields to be updated.

Also thought a fair bit on what the best identifiers for devices where - categories, model types, etc

As always debugging lambda functions

I would want most of the device logic to be a seperate package

Cant test invalid jsons through gateway tool

### Expansion

Lambda triggers on dynamodb changes to talk to the devices and update them with whats been put in the table.

Or cron jobs periodically checking for table updates and pushing them out if not time critical.

## The Task Description

### Overview

Welcome to the future of home automation! Your mission is to build a backend system acting as the central hub for managing IoT devices in a smart home environment. These IoT devices might include anything from smart lights to thermostats or security cameras. Your task is to create a RESTful web API that allows users to manage these devices, monitor their status, and control them remotely.

This task is designed to test your ability to design and implement a backend system with a focus on RESTful APIs, managing state, and handling real-time data in an IoT context.
Objectives:

- Create IoT Device Management API:

- Register a New Device:

  - Create an endpoint to register a new IoT device. The API should accept the necessary details to uniquely identify and describe the device.
    The response should return the details of the registered device, including a unique identifier.

- List All Devices:

  - Implement an endpoint to retrieve a list of all registered devices. This endpoint should return a summary of each device's details.

- Get Device Details:

  - Create an endpoint to retrieve the details of a specific device by its unique identifier.

- Update Device Status:

  - Provide an endpoint to update the status or configuration of a specific device. This could be used, for example, to turn a light on or off, adjust a thermostat, etc.
  - The response should confirm the updated status or configuration.

- Delete a Device:
  - Implement an endpoint to delete a specific device from the system. The response should confirm the deletion.

### Requirements:

- Use any backend technology stack you are comfortable with (e.g., Node.js, Python, Ruby, etc.).
- Use any form of data storage (in-memory database, relational database, file storage, etc.) to manage device state and history.
- Write clean, maintainable code with appropriate documentation.
- Include error handling for common edge cases (e.g., invalid device IDs, bad input data).

### Deliverables:

- A link to your public GitHub repository with the project code.
- A README file with instructions on how to run the project, including any assumptions you made.
- (Optional) A brief summary of your approach and any interesting challenges you encountered.

Good luck on your mission to make smart homes even smarter! The future of home automation is in your hands.
