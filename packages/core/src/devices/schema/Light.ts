import { z } from "zod";
import { baseDeviceSchema } from "./BaseDevice";

export const lightSchema = baseDeviceSchema.extend({
  colour: z.string().default("White"), // What colour the bulb is currently
  intensity: z.number().default(100), // How bright the bulb is currently
});

export type Light = z.infer<typeof lightSchema>;
