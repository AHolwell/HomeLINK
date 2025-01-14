import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { constructDeviceUpdateExpressions, createDevice, isDevice } from "..";
import { RegisterRequest } from "../../parsing/schema/requestBodies";

// Mock the deviceSchemas import
vi.mock("../../schema", () => ({
  deviceSchemas: {
    testcategory: z.object({
      deviceId: z.string(),
      deviceCategory: z.string(),
      deviceName: z.string().optional(),
      testField: z.string().default("testValue"),
      userId: z.string(),
    }),
  },
  baseDeviceSchema: z.object({
    deviceId: z.string(),
    deviceCategory: z.string(),
    deviceName: z.string().optional(),
    userId: z.string(),
  }),
}));

describe("isDevice function", () => {
  it("should return true for a valid device", () => {
    //Arrange
    const validDevice = {
      deviceId: "1",
      deviceName: "Test Device",
      deviceCategory: "TestCategory",
      userId: "123",
    };

    //Act + Assert
    expect(isDevice(validDevice)).toBe(true);
  });

  it("should return false for an invalid device", () => {
    //Arrange
    const invalidDevice = {
      deviceId: 1,
      deviceName: "Test Device",
    };

    //Act + Assert
    expect(isDevice(invalidDevice)).toBe(false);
  });
});

describe("createDevice", () => {
  it("should construct a category specific device for a given category", () => {
    //Arrange
    const registerRequest: RegisterRequest = {
      deviceCategory: "testcategory",
      deviceId: "1",
      userId: "123",
    };

    //Act
    const device = createDevice(registerRequest);

    //Assert
    expect(device).toEqual({
      deviceCategory: "testcategory",
      deviceId: "1",
      testField: "testValue",
      userId: "123",
    });
  });

  it("should construct a base device for a custom/unrecognised category", () => {
    //Arrange
    const registerRequest: RegisterRequest = {
      deviceCategory: "myRandomCategory",
      deviceId: "1",
      userId: "123",
    };

    //Act
    const device = createDevice(registerRequest);

    //Assert
    expect(device).toEqual({
      deviceCategory: "myRandomCategory",
      deviceId: "1",
      userId: "123",
    });
  });
});

describe("constructDeviceUpdateExpressions function", () => {
  it("should correctly construct the updateExpression and expressionAttributeValues", () => {
    //Arrange
    const deviceUpdate = {
      deviceName: "Updated Device",
      testField: "myNewTestField",
    };

    //Act
    const { updateExpression, expressionAttributeValues } =
      constructDeviceUpdateExpressions(deviceUpdate);

    //Assert
    expect(updateExpression).toBe(
      "SET deviceName = :deviceName, testField = :testField",
    );
    expect(expressionAttributeValues).toEqual({
      ":deviceName": "Updated Device",
      ":testField": "myNewTestField",
    });
  });

  it("should handle a single field update", () => {
    //Arrange
    const deviceUpdate = {
      deviceName: "123",
    };

    //Act
    const { updateExpression, expressionAttributeValues } =
      constructDeviceUpdateExpressions(deviceUpdate);

    //Assert
    expect(updateExpression).toBe("SET deviceName = :deviceName");
    expect(expressionAttributeValues).toEqual({
      ":deviceName": "123",
    });
  });
});
