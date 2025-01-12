import { describe, it, expect } from "vitest";
import {
  invalidValuesError,
  missingFieldError,
  nonUpdatableFieldsError,
} from "..";

describe("missingFieldError", () => {
  it.each([
    ["modelType", "Missing required field: modelType"],
    [
      "field Name With Spaces",
      "Missing required field: field Name With Spaces",
    ],
  ])(
    "should return the correct error message for field: %s",
    (field, expectedMessage) => {
      //Act
      const result = missingFieldError(field);
      //Assert
      expect(result).toBe(expectedMessage);
    },
  );
});

describe("nonUpdatableFieldsError", () => {
  it.each([
    [["modelType"], "You cannot update the following field(s): modelType"],
    [
      ["modelType", "registeredAt"],
      "You cannot update the following field(s): modelType, registeredAt",
    ],
  ])(
    "should return the correct error message for field: %s",
    (fields, expectedMessage) => {
      //Act
      const result = nonUpdatableFieldsError(fields);
      //Assert
      expect(result).toBe(expectedMessage);
    },
  );
});

describe("invalidValuesError", () => {
  it.each([
    [["field1: value1"], "The following values are invalid: field1: value1"],
    [
      ["field1: value1", "field2: value2"],
      "The following values are invalid: field1: value1, field2: value2",
    ],
    [
      ["field1: value1", "field2: value2", "field3: value3"],
      "The following values are invalid: field1: value1, field2: value2, field3: value3",
    ],
  ])(
    "should return the correct error message for fields: %s",
    (fields, expectedMessage) => {
      // Act
      const result = invalidValuesError(fields);

      // Assert
      expect(result).toBe(expectedMessage);
    },
  );
});
