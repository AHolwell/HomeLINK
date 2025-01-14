import { describe, it, expect } from "vitest";
import { ZodError, ZodIssue } from "zod";
import { formatZodError } from "..";

describe("formatZodError function", () => {
  it("should correctly format missing fields", () => {
    //Arrange
    const error = new ZodError([
      {
        path: ["field1"],
        message: "Field required",
        code: "invalid_type",
        received: "undefined",
        expected: "string",
      } as ZodIssue,
    ]);

    //Act
    const formattedError = formatZodError(error);

    //Assert
    expect(formattedError).toBe("Missing required field(s): field1");
  });

  it("should correctly format invalid type errors", () => {
    //Arrange
    const error = new ZodError([
      {
        path: ["field1"],
        message: "Invalid type",
        code: "invalid_type",
        received: "number",
        expected: "string",
      } as ZodIssue,
    ]);

    //Act
    const formattedError = formatZodError(error);

    //Assert
    expect(formattedError).toBe(
      "Invalid type or other error on the following field(s): field1 (expected string, received number)",
    );
  });

  it("should correctly format too big field errors", () => {
    //Arrange
    const error = new ZodError([
      {
        path: ["field1"],
        message: "Too big",
        code: "too_big",
        maximum: 10,
        type: "string",
        inclusive: true,
      } as ZodIssue,
    ]);

    //Act
    const formattedError = formatZodError(error);

    //Assert
    expect(formattedError).toBe(
      "Field(s) exceeding maximum size: field1 (maximum 10 string inclusive)",
    );
  });

  it("should correctly format too small field errors", () => {
    //Arrange
    const error = new ZodError([
      {
        path: ["field1"],
        message: "Too small",
        code: "too_small",
        minimum: 5,
        type: "string",
        inclusive: true,
      } as ZodIssue,
    ]);

    //Act
    const formattedError = formatZodError(error);

    //Assert
    expect(formattedError).toBe(
      "Field(s) below minimum size: field1 (minimum 5 string inclusive)",
    );
  });

  it("should correctly format invalid enum value errors", () => {
    //Arrange
    const error = new ZodError([
      {
        path: ["field1"],
        message: "Invalid enum value",
        code: "invalid_enum_value",
        received: "invalid",
        options: ["option1", "option2"],
      } as ZodIssue,
    ]);

    //Act
    const formattedError = formatZodError(error);

    //Assert
    expect(formattedError).toBe(
      'Invalid value for enum field(s): field1 (received "invalid", expected one of: option1, option2)',
    );
  });

  it("should correctly format custom error messages", () => {
    //Arrange
    const error = new ZodError([
      {
        path: ["field1"],
        message: "Custom validation failed",
        code: "custom",
        received: "undefined",
        expected: "string",
      } as ZodIssue,
    ]);

    //Act
    const formattedError = formatZodError(error);

    //Assert
    expect(formattedError).toBe(
      "Custom error(s): field1 (custom error: Custom validation failed)",
    );
  });

  it("should return a combined, formatted error message for multiple errors", () => {
    //Arrange
    const error = new ZodError([
      {
        path: ["field1"],
        message: "Invalid type",
        code: "invalid_type",
        received: "number",
        expected: "string",
      } as ZodIssue,
      {
        path: ["field2"],
        message: "Too small",
        code: "too_small",
        minimum: 5,
        type: "string",
        inclusive: true,
      } as ZodIssue,
    ]);

    //Act
    const formattedError = formatZodError(error);

    //Assert
    expect(formattedError).toBe(
      "Invalid type or other error on the following field(s): field1 (expected string, received number). Field(s) below minimum size: field2 (minimum 5 string inclusive)",
    );
  });

  it("should return an empty string if no errors are present", () => {
    //Arrange
    const error = new ZodError([]);

    //Act
    const formattedError = formatZodError(error);

    //Assert
    expect(formattedError).toBe("");
  });
});
