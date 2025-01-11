# HomeLink Interview Task


### Warning!

This project uses the SST framework.

It will deploy resources to your AWS account, and as such will need an AWS profile with sufficient IAM permissions to provision.

### Hosted Version
// TODO maybe just get the aholwell domain to not worry about it being the nuvola consulting one

I will host the app at :

* API: ```api.homelink.nuvolaconsulting.co.uk```

* Frontend: ```homelink.nuvolaconsulting.co.uk```

## Get started

1. [Configure an AWS profile](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html) following your preffered method.

2. Install root packages
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

## Usage

To test the endpoints, as they are behind IAM auth I reccomend using [AWS API Gateway Test CLI](https://github.com/AnomalyInnovations/aws-api-gateway-cli-test)

Please find detailed commands in ```commands.md```

Run the unit tests within the package - havent set up doing it from root *** TODO maybe? *** 

*** TODO: Check if it uses a different userpool for prod ***

```
$ npx aws-api-gateway-cli-test \
  --username='<USERNAME>' \
  --password='<PASSWORD>' \
  --user-pool-id='eu-west-2_wwABMsyxN' \
  --app-client-id='e3v17bmfascm2uja498pjrfg1' \
  --cognito-region='eu-west-2' \
  --identity-pool-id='eu-west-2:8592e0b9-3b7c-4564-ba15-4bf19d1665b2' \
  --invoke-url='dev.api.homelink.nuvolaconsulting.co.uk' \
  --api-gateway-region='eu-west-2' \
  --path-template='/devices' \
  --method='POST' \
  --body='{}'
```


## The Task Description

### Overview

Welcome to the future of home automation! Your mission is to build a backend system acting as the central hub for managing IoT devices in a smart home environment. These IoT devices might include anything from smart lights to thermostats or security cameras. Your task is to create a RESTful web API that allows users to manage these devices, monitor their status, and control them remotely.

This task is designed to test your ability to design and implement a backend system with a focus on RESTful APIs, managing state, and handling real-time data in an IoT context.
Objectives:

* Create IoT Device Management API:

* Register a New Device:
   * Create an endpoint to register a new IoT device. The API should accept the necessary details to uniquely identify and describe the device.
            The response should return the details of the registered device, including a unique identifier.

* List All Devices:
   * Implement an endpoint to retrieve a list of all registered devices. This endpoint should return a summary of each device's details.

* Get Device Details:
   * Create an endpoint to retrieve the details of a specific device by its unique identifier.

* Update Device Status:
   * Provide an endpoint to update the status or configuration of a specific device. This could be used, for example, to turn a light on or off, adjust a thermostat, etc.
   * The response should confirm the updated status or configuration.

* Delete a Device:
   * Implement an endpoint to delete a specific device from the system. The response should confirm the deletion.

### Requirements:

* Use any backend technology stack you are comfortable with (e.g., Node.js, Python, Ruby, etc.).
* Use any form of data storage (in-memory database, relational database, file storage, etc.) to manage device state and history.
* Write clean, maintainable code with appropriate documentation.
* Include error handling for common edge cases (e.g., invalid device IDs, bad input data).

### Deliverables:

* A link to your public GitHub repository with the project code.
* A README file with instructions on how to run the project, including any assumptions you made.
* (Optional) A brief summary of your approach and any interesting challenges you encountered.


Good luck on your mission to make smart homes even smarter! The future of home automation is in your hands.
