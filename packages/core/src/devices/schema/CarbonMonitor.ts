import { z } from "zod";
import { baseDeviceSchema } from "./BaseDevice";

export const carbonMonitorSchema = baseDeviceSchema.extend({
  alarmThreshold: z.number().default(220), // ID associated with owner of device
});

export type CarbonMonitor = z.infer<typeof carbonMonitorSchema>;
