import { APIGatewayProxyEvent } from "aws-lambda";
import { EventBody } from ".";
import * as uuid from "uuid";
import { CarbonMonitor, Device, Light } from "./types";

export const modelTypeToDeviceType: Record<string, string> = {
  LED: "Light",
  Flourescent: "Light",
  CO: "CarbonMonitor",
  CO2: "CarbonMonitor",
};

type DeviceConstructor<T extends Device> = (
  event: APIGatewayProxyEvent,
  body: EventBody,
) => T;

export const deviceFactories: Record<string, DeviceConstructor<Device>> = {
  // Using default values for constructing the device for simplicity, in a realy use case, I imagine there would be some lookup based off the device model
  // Similarly there might be reason to want to make device names unique to an account, but as it isnt used for indexing its not that important.
  Light: (event: any, body: EventBody): Light => ({
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
  CarbonMonitor: (event: any, body: EventBody): CarbonMonitor => ({
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
