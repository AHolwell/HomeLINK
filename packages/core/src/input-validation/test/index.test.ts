import { describe, it, expect, vi } from "vitest";
import { validateId, validateRegisterBody, validationFunctions } from "..";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Errors, missingFieldError, ValidationError } from "../../errors";
import * as uuid from "uuid";

describe("validateRegisterBody", () => {
  it.each([
    ['{"modelType": "LED"}', { modelType: "LED" }],
    ['{"modelType": "Fluorescent"}', { modelType: "Fluorescent" }],
    ['{"modelType": "CO"}', { modelType: "CO" }],
  ])(
    "should return the body for valid event with body: %s",
    (eventBody, expected) => {
      //Arrange
      const event: APIGatewayProxyEvent = {
        body: eventBody,
      } as unknown as APIGatewayProxyEvent;

      //Act + Assert
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
      //Arrange
      const event: APIGatewayProxyEvent = {
        body: eventBody,
      } as unknown as APIGatewayProxyEvent;

      //Act + Assert
      expect(() => validateRegisterBody(event)).toThrowError(expectedError);
    },
  );
});

describe("validateId", () => {
  it("should throw an error for an empty UUID", () => {
    //Arrange
    vi.spyOn(uuid, "validate").mockReturnValue(false); //Shouldnt run the validate code on happy, but included for future debug purposes

    //Act + Assert
    expect(() => validateId("")).toThrowError(
      new ValidationError(Errors.MissingId),
    );
  });

  it("should throw ValidationError for an invalid UUID", () => {
    //Arrange
    vi.spyOn(uuid, "validate").mockReturnValue(false);

    //Act + Assert
    expect(() => validateId("invalidId")).toThrowError(
      new ValidationError(Errors.InvalidId),
    );
  });

  it("should not throw an error for a valid UUID", () => {
    //Arrange
    vi.spyOn(uuid, "validate").mockReturnValue(true);

    //Act + Assert
    expect(() => validateId("validId")).not.toThrow();
  });
});

describe("validationFunctions", () => {
  describe("deviceName", () => {
    it.each([
      ["Device 1", true],
      ["", true],
      [123, false],
      [null, false],
      [undefined, false],
    ])("should return %s for value: %s", (value, expected) => {
      // Act
      const result = validationFunctions.deviceName(value);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe("isPowered", () => {
    it.each([
      [true, true],
      [false, true],
      [1, false],
      [null, false],
      ["true", false],
    ])("should return %s for value: %s", (value, expected) => {
      // Act
      const result = validationFunctions.isPowered(value);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe("colour", () => {
    it.each([
      ["Red", true],
      ["Yellow", true],
      ["White", true],
      ["Green", true],
      ["Blue", false],
      ["", false],
      [123, false],
    ])("should return %s for value: %s", (value, expected) => {
      // Act
      const result = validationFunctions.colour(value);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe("intensity", () => {
    it.each([
      [0, true],
      [50, true],
      [100, true],
      [-1, false],
      [101, false],
      ["50", false],
      [null, false],
    ])("should return %s for value: %s", (value, expected) => {
      // Act
      const result = validationFunctions.intensity(value);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe("alarmThreshold", () => {
    it.each([
      [50, true],
      [1000, true],
      [0, false],
      [-1, false],
      ["50", false],
      [null, false],
    ])("should return %s for value: %s", (value, expected) => {
      // Act
      const result = validationFunctions.alarmThreshold(value);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
