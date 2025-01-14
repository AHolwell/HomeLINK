import { BaseDevice, BaseDeviceUpdate } from "./BaseDevice";
import { CarbonMonitor, CarbonMonitorUpdate } from "./CarbonMonitor";
import { Light, LightUpdate } from "./Light";

export type Device = BaseDevice | Light | CarbonMonitor;
export type DeviceUpdate = BaseDeviceUpdate | LightUpdate | CarbonMonitorUpdate;
