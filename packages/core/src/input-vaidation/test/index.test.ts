import { describe, it, expect, vi } from "vitest";
import { validateId, validateRegisterBody } from "..";
import { APIGatewayProxyEvent } from "aws-lambda";
import {
  Errors,
  missingFieldError,
  ValidationError,
} from "../../errors/errors";
import * as uuid from "uuid";

describe("validateRegisterBody", () => {
  it.each([
    ['{"modelType": "LED"}', { modelType: "LED" }],
    ['{"modelType": "Fluorescent"}', { modelType: "Fluorescent" }],
    ['{"modelType": "CO"}', { modelType: "CO" }],
  ])(
    "should return the body for valid event with body: %s",
    (eventBody, expected) => {
      const event: APIGatewayProxyEvent = {
        body: eventBody,
      } as unknown as APIGatewayProxyEvent;

      expect(validateRegisterBody(event)).toEqual(expected);
    },
  );

  it.each([
    [null, Errors.NoBody],
    ["", Errors.NoBody],
    [undefined, Errors.NoBody],
    ["{badJson}", Errors.InvalidJson],
    ['{"modelType": ""}', missingFieldError("modelType")],
    ["{}", missingFieldError("modelType")],
  ])(
    "should throw an error for invalid event with body: %s",
    (eventBody, expectedError) => {
      const event: APIGatewayProxyEvent = {
        body: eventBody,
      } as unknown as APIGatewayProxyEvent;

      expect(() => validateRegisterBody(event)).toThrowError(expectedError);
    },
  );
});

describe("validateId", () => {
  it("should throw an error for an empty UUID", () => {
    vi.spyOn(uuid, "validate").mockReturnValue(false); //Shouldnt run the validate code, but included for future debug purposes
    expect(() => validateId("")).toThrowError(
      new ValidationError(Errors.MissingId),
    );
  });

  it("should throw ValidationError for an invalid UUID", () => {
    vi.spyOn(uuid, "validate").mockReturnValue(false);
    expect(() => validateId("invalidId")).toThrowError(
      new ValidationError(Errors.InvalidId),
    );
  });

  it("should not throw an error for a valid UUID", () => {
    vi.spyOn(uuid, "validate").mockReturnValue(true);
    expect(() => validateId("validId")).not.toThrow();
  });
});
