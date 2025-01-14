import { z } from "zod";

export const genericRequestSchema = z.object({
  deviceId: z.string(),
  userId: z.string(),
});

export type GenericRequest = z.infer<typeof genericRequestSchema>;

export const listRequestSchema = z.object({
  userId: z.string(),
});

export type ListRequest = z.infer<typeof listRequestSchema>;

export const registerRequestSchema = z.object({
  deviceId: z.string(),
  deviceCategory: z.string(),
  deviceName: z.string().optional(),
});

// We dont want to allow the userId to be parsed from the body, but want it required on the type
export type RegisterRequest = z.infer<typeof registerRequestSchema> & {
  userId: string;
};
