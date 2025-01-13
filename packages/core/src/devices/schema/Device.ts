import { BaseDevice } from "./BaseDevice";
import { CarbonMonitor } from "./CarbonMonitor";
import { Light } from "./Light";

export type Device = BaseDevice | Light | CarbonMonitor;
