import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { StatusCode, ValidationError } from "../errors";

// This is just a wrapper for my lambda functions to avoid repeating the error catching, CORS, and response logic each time.
export namespace Util {
  export function handler(
    lambda: (evt: APIGatewayProxyEvent, context: Context) => Promise<string>,
  ) {
    return async function (event: APIGatewayProxyEvent, context: Context) {
      let body: string, statusCode: number;

      try {
        // Run the Lambda
        body = await lambda(event, context);
        statusCode = StatusCode.Success;
      } catch (error: any) {
        statusCode =
          error instanceof ValidationError
            ? error.statusCode
            : StatusCode.InternalServerError;
        body = JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Return HTTP response
      return {
        body,
        statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
      };
    };
  }
}
