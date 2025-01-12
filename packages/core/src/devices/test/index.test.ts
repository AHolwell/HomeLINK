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
      const result = getUpdatableFields(deviceCategory);
      expect(result).toEqual(expectedFields);
    },
  );

  it("should throw an error for an unknown device category", () => {
    expect(() => getUpdatableFields("UnknownCategory")).toThrow();
  });
});

describe("constructUpdateExpressions", () => {
  it("should return valid update expressions for allowed fields", () => {
    const allowedFields = ["field1", "field2"];
    const bodyString = JSON.stringify({
      field1: "value1",
      field2: "value2",
    });

    const result = constructUpdateExpressions(allowedFields, bodyString);

    expect(result.updateExpression.trim()).toBe(
      "SET field1 = :field1 field2 = :field2",
    );
    expect(result.expressionAttributeValues).toEqual({
      ":field1": "value1",
      ":field2": "value2",
    });
  });

  it("should throw an error if there are invalid fields", () => {
    const allowedFields = ["field1"];
    const bodyString = JSON.stringify({
      field1: "value1",
      invalidField: "value2",
    });

    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      "You cannot update the following field(s): invalidField",
    );
  });

  it("should return an empty update expression if the body is empty", () => {
    const allowedFields = ["field1", "field2"];
    const bodyString = JSON.stringify({});

    const result = constructUpdateExpressions(allowedFields, bodyString);

    expect(result.updateExpression.trim()).toBe("SET");
    expect(result.expressionAttributeValues).toEqual({});
  });

  it("should handle body with only invalid fields", () => {
    const allowedFields = ["field1"];
    const bodyString = JSON.stringify({
      invalidField1: "value1",
      invalidField2: "value2",
    });

    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      "You cannot update the following field(s): invalidField1, invalidField2",
    );
  });

  it("should throw an error if bodyString is not valid JSON", () => {
    const allowedFields = ["field1"];
    const bodyString = "invalid_json";

    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      "Unexpected token 'i', \"invalid_json\" is not valid JSON",
    );
  });
});
