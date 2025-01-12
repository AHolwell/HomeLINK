import { describe, it, expect } from "vitest";
import { missingFieldError, nonUpdatableFieldsError } from "../errors";

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
      const result = missingFieldError(field);
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
      const result = nonUpdatableFieldsError(fields);
      expect(result).toBe(expectedMessage);
    },
  );
});
