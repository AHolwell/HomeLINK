import { table } from "./storage";

// Create the API
export const api = new sst.aws.ApiGatewayV2("Api", {
  cors: true, //enabled by default anyway
  domain:
    $app.stage === "production"
      ? "api.homelink.nuvolaconsulting.co.uk"
      : "dev.api.homelink.nuvolaconsulting.co.uk",
  transform: {
    route: {
      handler: {
        // Allow the Lambdas backing the API to access the device table
        link: [table],
      },
      args: {
        // Front the API with cognito
        auth: { iam: true },
      },
    },
  },
});

//Set up the API routes and point them to the lambda handlers
api.route("POST /devices", "packages/functions/src/register.main");
api.route("GET /devices/{id}", "packages/functions/src/get.main");
api.route("GET /devices", "packages/functions/src/list.main");
api.route("PUT /devices/{id}", "packages/functions/src/update.main");
api.route("DELETE /devices/{id}", "packages/functions/src/delete.main");
