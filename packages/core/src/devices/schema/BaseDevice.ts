import { z } from "zod";

export const baseDeviceSchema = z.object({
  userId: z.string(), // ID associated with owner of device
  deviceId: z.string(), // Unique Identifier of the device (uuid)
  deviceCategory: z.string(), // What category the device fits into for shared functionality - implemented 'Light' and 'CarbonMonitor'
  registeredAt: z.number().default(Date.now()), // When the user registered this device, ms since epoch
  isPowered: z.boolean().default(true), // Whether the device is currently powered
  deviceName: z.string().optional(), // Optional field for user to give the device a nickname
});

export type BaseDevice = z.infer<typeof baseDeviceSchema>;
