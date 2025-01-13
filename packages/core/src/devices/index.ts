// Supporting functionality for the lambdas regarding device management
import { InternalError, InternalErrors } from "../errors";
import { RegisterRequest } from "../parsing/schema/requestBodies";
import { baseDeviceSchema, deviceSchemas } from "./schema";
import { Device } from "./schema/Device";

/**
 * Largely redundant type check that the device satisfies the schema for typechecking
 */
export const isDevice = (obj: any): obj is Device => {
  return baseDeviceSchema.safeParse(obj).success;
};

/**
 * Validates the request body and then constructs the device details
 *to be put into the dynamo table via a device factory mapped from the device category
 *
 * @param event The API gateway event passed into the register lambda
 * @returns A Device object ready to be put into the devices dynamoDB table
 */
export const createDevice = (registerRequest: RegisterRequest): Device => {
  const schema =
    deviceSchemas[registerRequest.deviceCategory.toLocaleLowerCase()] ||
    baseDeviceSchema;

  const device = schema.parse(registerRequest);

  if (!isDevice(device))
    throw new InternalError(InternalErrors.DeviceIncorrectlyConstructed);

  return device;
};
