import { describe, it, expect, vi } from "vitest";
import { APIGatewayProxyEvent } from "aws-lambda";
import {
  parseGenericRequest,
  parseListRequest,
  parseRegisterRequest,
  parseUpdateRequest,
} from "..";
import {
  InternalError,
  InternalErrors,
  ValidationError,
  ValidationErrors,
} from "../../errors";
import { deviceUpdateSchemas, baseDeviceUpdateSchema } from "../../schema";
import {
  genericRequestSchema,
  listRequestSchema,
  registerRequestSchema,
} from "../schema/requestBodies";
import { ZodError } from "zod";

vi.mock("../../schema", () => ({
  baseDeviceUpdateSchema: {
    safeParse: vi.fn(),
  },
  deviceUpdateSchemas: {
    mycategory: {
      safeParse: vi.fn(),
    },
  },
}));

vi.mock("../../errors", async () => {
  const actual = await vi.importActual("../../errors");
  return {
    ...actual,
    formatZodError: vi.fn(() => "Zod Error"),
  };
});

describe("Parsing Functions", () => {
  describe("parseGenericRequest", () => {
    it("parses valid input successfully", () => {
      //Arrange
      const event = {
        pathParameters: { id: "device123" },
        requestContext: {
          authorizer: {
            iam: { cognitoIdentity: { identityId: "user123" } },
          },
        },
      } as unknown as APIGatewayProxyEvent;

      //Act
      const result = parseGenericRequest(event);

      //Assert
      expect(result).toEqual({
        deviceId: "device123",
        userId: "user123",
      });
    });

    it("throws InternalError for invalid input", () => {
      //Arrange
      vi.spyOn(genericRequestSchema, "safeParse").mockReturnValueOnce({
        success: false,
        error: {},
      } as any);

      const event = {
        pathParameters: { id: null },
        requestContext: { authorizer: null },
      } as unknown as APIGatewayProxyEvent;

      //Act + Assert
      expect(() => parseGenericRequest(event)).toThrowError(
        new InternalError(InternalErrors.ParsingError),
      );
    });
  });

  describe("parseListRequest", () => {
    it("parses valid input successfully", () => {
      //Arrange
      const event = {
        requestContext: {
          authorizer: {
            iam: { cognitoIdentity: { identityId: "user123" } },
          },
        },
      } as unknown as APIGatewayProxyEvent;

      //Act
      const result = parseListRequest(event);

      //Assert
      expect(result).toEqual({
        userId: "user123",
      });
    });

    it("throws InternalError for invalid input", () => {
      //Arrange
      vi.spyOn(listRequestSchema, "safeParse").mockReturnValueOnce({
        success: false,
        error: {},
      } as any);

      const event = {
        requestContext: { authorizer: null },
      } as APIGatewayProxyEvent;

      //Act + Assert
      expect(() => parseListRequest(event)).toThrowError(
        new InternalError(InternalErrors.ParsingError),
      );
    });
  });

  describe("parseRegisterRequest", () => {
    it("parses valid input successfully", () => {
      //Arrange
      const event = {
        body: JSON.stringify({
          deviceId: "device123",
          deviceCategory: "category123",
        }),
        requestContext: {
          authorizer: {
            iam: { cognitoIdentity: { identityId: "user123" } },
          },
        },
      } as unknown as APIGatewayProxyEvent;

      //Act
      const result = parseRegisterRequest(event);

      //Assert
      expect(result).toEqual({
        deviceId: "device123",
        deviceCategory: "category123",
        userId: "user123",
      });
    });

    it("throws ValidationError for missing body", () => {
      //Arrange
      const event = {
        body: null,
      } as unknown as APIGatewayProxyEvent;

      //Act + Assert
      expect(() => parseRegisterRequest(event)).toThrowError(
        new ValidationError(ValidationErrors.NoBody),
      );
    });

    it("throws ValidationError for invalid JSON", () => {
      //Arrange
      const event = {
        body: "invalid-json",
      } as APIGatewayProxyEvent;

      //Act + Assert
      expect(() => parseRegisterRequest(event)).toThrowError(
        new ValidationError(ValidationErrors.InvalidJson),
      );
    });

    it("throws ValidationError for schema validation errors", () => {
      //Arrange
      vi.spyOn(registerRequestSchema, "safeParse").mockReturnValueOnce({
        success: false,
        error: {},
      } as any);

      const event = {
        body: JSON.stringify({
          deviceId: 123, // invalid type
        }),
        requestContext: {
          authorizer: {
            iam: { cognitoIdentity: { identityId: "user123" } },
          },
        },
      } as unknown as APIGatewayProxyEvent;

      //Act + Assert
      expect(() => parseRegisterRequest(event)).toThrowError(ValidationError);
    });
  });

  describe("parseUpdateRequest", () => {
    it("parses valid input successfully with a specific device category", () => {
      //Arrange
      const event = {
        body: JSON.stringify({ fieldToUpdate: "value" }),
      } as APIGatewayProxyEvent;

      vi.spyOn(deviceUpdateSchemas["mycategory"], "safeParse").mockReturnValue({
        success: true,
        data: { fieldToUpdate: "value" },
      });

      //Act
      const result = parseUpdateRequest(event, "MyCategory");

      //Assert
      expect(result).toEqual({ fieldToUpdate: "value" });
    });

    it("parses valid input successfully with base schema", () => {
      const event = {
        body: JSON.stringify({ deviceName: "value" }),
      } as APIGatewayProxyEvent;
      //Arrange
      vi.spyOn(baseDeviceUpdateSchema, "safeParse").mockReturnValue({
        success: true,
        data: { deviceName: "value" },
      });

      //Act
      const result = parseUpdateRequest(event, "UnknownCategory");

      //Assert
      expect(result).toEqual({ deviceName: "value" });
    });

    it("throws ValidationError for missing body", () => {
      //Arrange
      const event = {
        body: null,
      } as unknown as APIGatewayProxyEvent;

      //Act + Assert
      expect(() => parseUpdateRequest(event, "MyCategory")).toThrowError(
        new ValidationError(ValidationErrors.NoBody),
      );
    });

    it("throws ValidationError for invalid JSON", () => {
      //Arrange
      const event = {
        body: "invalid-json",
      } as APIGatewayProxyEvent;

      //Act + Assert
      expect(() => parseUpdateRequest(event, "MyCategory")).toThrowError(
        new ValidationError(ValidationErrors.InvalidJson),
      );
    });

    it("throws ValidationError for schema validation errors", () => {
      //Arrange
      vi.spyOn(baseDeviceUpdateSchema, "safeParse").mockReturnValue({
        success: false,
        error: new ZodError([]),
      });

      const event = {
        body: JSON.stringify({ invalidField: "value" }),
      } as APIGatewayProxyEvent;

      //Act + Assert
      expect(() => parseUpdateRequest(event, "UnknownCategory")).toThrowError(
        ValidationError,
      );
    });
  });
});
