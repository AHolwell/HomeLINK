import { describe, it, expect, vi } from "vitest";
import { constructUpdateExpressions, getUpdatableFields } from "..";
import {
  updateableBaseFields,
  updateableLightFields,
  updateableMonitorFields,
} from "../types";

describe("getUpdatableFields", () => {
  it.each([
    {
      deviceCategory: "Light",
      expectedFields: [...updateableBaseFields, ...updateableLightFields],
    },
    {
      deviceCategory: "CarbonMonitor",
      expectedFields: [...updateableBaseFields, ...updateableMonitorFields],
    },
  ])(
    "should return the correct updatable fields for $deviceCategory",
    ({ deviceCategory, expectedFields }) => {
      //Act
      const result = getUpdatableFields(deviceCategory);
      //Assert
      expect(result).toEqual(expectedFields);
    },
  );

  it("should throw an error for an unknown device category", () => {
    expect(() => getUpdatableFields("UnknownCategory")).toThrow();
  });
});

describe("constructUpdateExpressions", () => {
  it("should return valid update expressions for allowed fields with valid values", () => {
    // Arrange
    const allowedFields = ["deviceName", "intensity"];
    const bodyString = JSON.stringify({
      deviceName: "Device 1",
      intensity: 50,
    });

    // Act
    const result = constructUpdateExpressions(allowedFields, bodyString);

    // Assert
    expect(result.updateExpression.trim()).toBe(
      "SET deviceName = :deviceName intensity = :intensity",
    );
    expect(result.expressionAttributeValues).toEqual({
      ":deviceName": "Device 1",
      ":intensity": 50,
    });
  });

  it("should throw an error if there are invalid fields", () => {
    // Arrange
    const allowedFields = ["deviceName"];
    const bodyString = JSON.stringify({
      deviceName: "Device 1",
      invalidField: "value2",
    });

    // Act + Assert
    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      "You cannot update the following field(s): invalidField",
    );
  });

  it("should throw an error if there are invalid values", () => {
    // Arrange
    const allowedFields = ["deviceName", "intensity", "colour", "isPowered"];
    const bodyString = JSON.stringify({
      deviceName: 123, // Invalid: should be a string
      intensity: 150, // Invalid: should be in range 0-100
      colour: "Red", // Valid - Should not appear in error
      isPowered: true,
    });

    // Act + Assert
    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      "The following values are invalid: deviceName: 123, intensity: 150",
    );
  });

  it("should return an empty update expression if the body is empty", () => {
    // Arrange
    const allowedFields = ["deviceName", "intensity"];
    const bodyString = JSON.stringify({});

    // Act
    const result = constructUpdateExpressions(allowedFields, bodyString);

    // Assert
    expect(result.updateExpression.trim()).toBe("SET");
    expect(result.expressionAttributeValues).toEqual({});
  });

  it("should handle body with only invalid fields", () => {
    // Arrange
    const allowedFields = ["deviceName"];
    const bodyString = JSON.stringify({
      invalidField1: "value1",
      invalidField2: "value2",
    });

    // Act + Assert
    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      "You cannot update the following field(s): invalidField1, invalidField2",
    );
  });

  it("should validate boolean fields correctly", () => {
    // Arrange
    const allowedFields = ["isPowered"];
    const bodyString = JSON.stringify({
      isPowered: true,
    });

    // Act
    const result = constructUpdateExpressions(allowedFields, bodyString);

    // Assert
    expect(result.updateExpression.trim()).toBe("SET isPowered = :isPowered");
    expect(result.expressionAttributeValues).toEqual({
      ":isPowered": true,
    });
  });

  it("should throw an error if bodyString is not valid JSON", () => {
    // Arrange
    const allowedFields = ["deviceName"];
    const bodyString = "invalid_json";

    // Act + Assert
    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      "Unexpected token 'i', \"invalid_json\" is not valid JSON",
    );
  });
});
