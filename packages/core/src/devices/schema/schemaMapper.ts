import { z } from "zod";
import { baseDeviceSchema } from "./BaseDevice";
import {
  carbonMonitorSchema,
  carbonMonitorUpdateSchema,
} from "./CarbonMonitor";
import { lightSchema, lightUpdateSchema } from "./Light";

export const deviceSchemas: Record<string, z.ZodObject<any>> = {
  light: lightSchema,
  carbonmonitor: carbonMonitorSchema,
};

export const deviceUpdateSchemas: Record<string, z.ZodObject<any>> = {
  light: lightUpdateSchema,
  carbonmonitor: carbonMonitorUpdateSchema,
};
