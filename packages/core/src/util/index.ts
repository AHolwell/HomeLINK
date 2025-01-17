import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { InternalErrors, StatusCode } from "../errors";

export namespace Util {
  /**
   * A wrapper for lambda functions to handle the HTTP response construction and error handling
   *
   * @param lambda the lambda function to be wrapped
   * @returns the HTTP response expected by API gateway from the lambda execution, with custom body
   */
  export function handler(
    lambda: (evt: APIGatewayProxyEvent, context: Context) => Promise<string>,
  ) {
    return async function (event: APIGatewayProxyEvent, context: Context) {
      let body: string, statusCode: number;
      try {
        // Run lambda code
        body = await lambda(event, context);
        statusCode = StatusCode.Success;
      } catch (error: any) {
        switch (error?.name) {
          // Return validation error info as it is curated and helpful to the user
          case "ValidationError":
            statusCode = error.statusCode;
            body = JSON.stringify({ error: error.message });
            break;
          // Only return internal errors outside of prod for security
          case "InternalError":
            //Log the error using chosen logging service.
            //Then return generic to avoid potential information leak.
            statusCode = StatusCode.InternalServerError;
            body = JSON.stringify({ error: InternalErrors.Generic });
            break;
          // Unexpected error types handling
          default:
            //Log the error using chosen logging service.
            //Then return generic to avoid potential information leak.
            statusCode = StatusCode.InternalServerError;
            body = JSON.stringify({ error: InternalErrors.Generic });
            break;
        }
      }
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
