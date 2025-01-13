import { Context, APIGatewayProxyEvent } from "aws-lambda";
import {
  InternalError,
  InternalErrors,
  StatusCode,
  ValidationError,
} from "../errors";
import { isAwaitKeyword } from "typescript";

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
        switch (error?.name) {
          case "ValidationError":
            statusCode = error.StatusCode;
            body = JSON.stringify(error.message);
          case "InternalError":
            statusCode = error.StatusCode;
            body =
              event.requestContext.stage !== "production"
                ? error.message
                : InternalErrors.Generic;
          default:
            statusCode = error?.statusCode ?? StatusCode.InternalServerError;
            body = JSON.stringify({
              //Error message if it exists, if not in prod stringify the error for debug purposes, in prod give default error to prevent info leak potential
              //Presumably in prod there would be logging to see what went wrong.
              //There is an argument for only throwing generic errors in prod, though given the assumption of customers directlyusing the api, I want to give them some more
              error:
                error?.message ??
                (event.requestContext.stage !== "production"
                  ? String(error)
                  : InternalErrors.Generic),
            });
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

  /**
   * Constructs the updateExpression expressionAttributeValues
   * needed to update the fields in the dynamodb table through the UpdateCommand
   *
   * WARNING: Assumes that the update object is safe
   */
  export function constructUpdateExpressions(updateObject: object) {
    let updateExpression: string = "SET ";

    Object.keys(updateExpression).forEach((key) => {
      updateExpression += `${key} = :${key} `;
    });

    const expressionAttributeValues = Object.fromEntries(
      Object.entries(updateObject).map(([key, value]) => [`:${key}`, value]),
    );

    return { updateExpression, expressionAttributeValues };
  }
}
