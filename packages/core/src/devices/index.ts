import { InternalError, InternalErrors } from "../errors";
import { RegisterRequest } from "../parsing/schema/requestBodies";
import { baseDeviceSchema, deviceSchemas } from "../schema";
import { Device, DeviceUpdate } from "../schema/Device";

/**
 * Largely redundant type check that the device satisfies the schema for typechecking
 *
 * @param {any} obj the device you want to typecheck
 * @returns whether the typecheck passed
 */
export const isDevice = (obj: any): obj is Device => {
  return baseDeviceSchema.safeParse(obj).success;
};

/**
 * Constructs a device object from the schema associated with the device category
 *
 * @param {RegisterRequest} registerRequest the parsed request to register a device
 * @returns the device object
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

/**
 * Constructs the updateExpression expressionAttributeValues
 * needed to update the fields in the dynamodb table through the UpdateCommand
 *
 * Assumes that the deviceUpdate object is safe
 *
 * @param {DeviceUpdate} deviceUpdate object ocntaining the fields to update
 * @returns the updateExpression and expressionAttributeValues ready for the UpdateCommand
 */
export function constructDeviceUpdateExpressions(deviceUpdate: DeviceUpdate) {
  let updateExpression =
    "SET " +
    Object.keys(deviceUpdate)
      .map((key) => `${key} = :${key}`)
      .join(", ");

  const expressionAttributeValues = Object.fromEntries(
    Object.entries(deviceUpdate).map(([key, value]) => [`:${key}`, value]),
  );

  return { updateExpression, expressionAttributeValues };
}
