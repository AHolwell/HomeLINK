import { table } from "./storage";

//TODO rate limit API

// Create the API
export const api = new sst.aws.ApiGatewayV2("Api", {
  cors: true, //enabled by default anyway
  domain: $app.stage === "production" ? 
    "api.homelink.nuvolaconsulting.co.uk" : 
    "dev.api.homelink.nuvolaconsulting.co.uk",
  transform: {
    route: {
      handler: {
        link: [table],
      },
      args: {
        auth: { iam: true }
      },
    }
  }
});

api.route("POST /devices", "packages/functions/src/register.main");
api.route("GET /devices/{id}", "packages/functions/src/get.main");
api.route("GET /devices", "packages/functions/src/list.main");
api.route("PUT /devices/{id}", "packages/functions/src/update.main");
api.route("DELETE /devices/{id}", "packages/functions/src/delete.main");