import { z } from "zod";
import { baseDeviceSchema } from "./BaseDevice";
import { carbonMonitorSchema } from "./CarbonMonitor";
import { lightSchema } from "./Light";

export const deviceCategorySchemas: Record<string, z.ZodObject<any>> = {
  light: lightSchema,
  carbonmonitor: carbonMonitorSchema,
};
