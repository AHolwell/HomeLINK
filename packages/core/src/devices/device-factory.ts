import { APIGatewayProxyEvent } from "aws-lambda";
import * as uuid from "uuid";
import { CarbonMonitor, Device, Light } from "./types";
import { RegisterEventBody } from "../input-validation";

/**
 * Maps a model type to a device category
 *
 * Discussion Note:
 * This was potentially an unecessary extra step, could have just used category at registration
 * Though registering a model rather than just a 'light' felt more realistic form a consumer standpoint
 */
export const modelTypeToDeviceType: Record<string, string> = {
  LED: "Light",
  Flourescent: "Light",
  CO: "CarbonMonitor",
  CO2: "CarbonMonitor",
};

/**
 * Maps device category to a deviceFactory to construct the details
 *
 * Discussion Note:
 * Using default values for constructing the device for simplicity, in a real use case, I imagine there would be some lookup based off the device model
 * Similarly there might be reason to want to make device names unique to an account, but as it isnt used for indexing its not that important.
 */
type DeviceConstructor<T extends Device> = (
  event: APIGatewayProxyEvent,
  body: RegisterEventBody,
) => T;

export const deviceFactories: Record<string, DeviceConstructor<Device>> = {
  Light: (event: any, body: RegisterEventBody): Light => ({
    userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
    deviceId: uuid.v1(),
    deviceCategory: "Light",
    reigisteredAt: Date.now(),
    deviceName: body?.deviceName ?? "",
    isPowered: true,
    modelType: body.modelType,
    colour: "White",
    intensity: 100,
  }),
  CarbonMonitor: (event: any, body: RegisterEventBody): CarbonMonitor => ({
    userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
    deviceId: uuid.v1(),
    deviceCategory: "CarbonMonitor",
    reigisteredAt: Date.now(),
    deviceName: body?.deviceName ?? "",
    isPowered: true,
    modelType: body.modelType,
    alarmThreshold: 220,
  }),
};
