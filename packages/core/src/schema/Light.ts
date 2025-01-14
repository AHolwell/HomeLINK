import { z } from "zod";
import { baseDeviceSchema, baseDeviceUpdateSchema } from "./BaseDevice";

export const lightSchema = baseDeviceSchema.extend({
  colour: z.string().default("White"), // What colour the bulb is currently
  intensity: z.number().default(100), // How bright the bulb is currently
});

const supportedLightColours: string[] = ["white", "Red", "Blue", "Green"];

export const lightUpdateSchema = baseDeviceUpdateSchema.extend({
  colour: z
    .string()
    .refine((val) => supportedLightColours.includes(val), {
      message: `The only currently supported colours are: ${supportedLightColours.join(", ")}`,
    })
    .optional(),
  intensity: z.number().int().min(0).max(100).optional(),
});

export type Light = z.infer<typeof lightSchema>;
export type LightUpdate = z.infer<typeof lightUpdateSchema>;
