import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { StatusCode, ValidationError } from "../errors";

export namespace Util {
  /**
   * A wrapper for my lambda function for DRY (dont repeat yourself) purposes
   * Wraps error handling around the function and handles the http response
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
        //Handle errors
        statusCode =
          error instanceof ValidationError
            ? error.statusCode
            : StatusCode.InternalServerError;
        body = JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        });
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
