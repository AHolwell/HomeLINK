import { z } from "zod";
import { baseDeviceSchema, baseDeviceUpdateSchema } from "./BaseDevice";

export const carbonMonitorSchema = baseDeviceSchema.extend({
  alarmThreshold: z.number().default(220), // ID associated with owner of device
});

export const carbonMonitorUpdateSchema = baseDeviceUpdateSchema.extend({
  alarmThreshold: z.number().positive().int().finite().safe().optional(),
});

export type CarbonMonitor = z.infer<typeof carbonMonitorSchema>;
export type CarbonMonitorUpdate = z.infer<typeof carbonMonitorUpdateSchema>;
