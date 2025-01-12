import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { Util } from "..";
import { StatusCode, ValidationError } from "../../errors";

describe("Util.handler", () => {
  const mockEvent = {} as APIGatewayProxyEvent;
  const mockContext = {} as Context;

  it("should return a success response when the lambda executes successfully", async () => {
    //Arrange
    const mockLambda = vi.fn().mockResolvedValue("Success response");
    const wrappedHandler = Util.handler(mockLambda);

    //Act
    const response = await wrappedHandler(mockEvent, mockContext);

    //Assert
    expect(mockLambda).toHaveBeenCalledWith(mockEvent, mockContext);
    expect(response).toEqual({
      body: "Success response",
      statusCode: StatusCode.Success,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  });

  it("should return a validation error response when the lambda throws a ValidationError", async () => {
    //Arrange
    const validationError = new ValidationError("Validation failed");
    const mockLambda = vi.fn().mockRejectedValue(validationError);
    const wrappedHandler = Util.handler(mockLambda);

    //Act
    const response = await wrappedHandler(mockEvent, mockContext);

    //Assert
    expect(mockLambda).toHaveBeenCalledWith(mockEvent, mockContext);
    expect(response).toEqual({
      body: JSON.stringify({ error: "Validation failed" }),
      statusCode: validationError.statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  });

  it("should return an internal server error response for unexpected errors", async () => {
    //Arrange
    const unexpectedError = new Error("Unexpected error");
    const mockLambda = vi.fn().mockRejectedValue(unexpectedError);
    const wrappedHandler = Util.handler(mockLambda);

    //Act
    const response = await wrappedHandler(mockEvent, mockContext);

    //Assert
    expect(mockLambda).toHaveBeenCalledWith(mockEvent, mockContext);
    expect(response).toEqual({
      body: JSON.stringify({ error: "Unexpected error" }),
      statusCode: StatusCode.InternalServerError,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  });

  it("should return an internal server error response for non-Error thrown values", async () => {
    //Arrange
    const unexpectedError = "Non-error string";
    const mockLambda = vi.fn().mockRejectedValue(unexpectedError);
    const wrappedHandler = Util.handler(mockLambda);

    //Act
    const response = await wrappedHandler(mockEvent, mockContext);

    //Assert
    expect(mockLambda).toHaveBeenCalledWith(mockEvent, mockContext);
    expect(response).toEqual({
      body: JSON.stringify({ error: "Non-error string" }),
      statusCode: StatusCode.InternalServerError,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  });
});
