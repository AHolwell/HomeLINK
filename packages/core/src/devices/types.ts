/**
 * This type defines the fields I chose for all devices to have stored
 */
export type BaseDevice = {
  userId: string; // ID associated with owner of device
  deviceId: string; // Unique Identifier of the device (uuid)
  reigisteredAt: number; // When the user registered this device
  deviceName?: string; // Optional field for user to give the device a nickname
  isPowered: boolean; // Whether the device is currently powered
  deviceCategory: string; // What category the device fits into for shared functionality - implemented 'Light' and 'CarbonMonitor'
  modelType: string; // The user selects their model type on registration, ie. 'LED' or 'Flourescent' bulbs
};

/**
 * Extending the base device for Light specific fields
 */
export type Light = BaseDevice & {
  colour: string; // What colour the bulb is currently
  intensity: number; // How bright the bulb is currently
};

/**
 * Extending the base device for Carbon Monitor specific fields
 */
export type CarbonMonitor = BaseDevice & {
  alarmThreshold: number; // At what ppt do we sound the alarm
};

/**
 * Union type for a generic device when needed
 */
export type Device = Light | CarbonMonitor;

// Hard coding of the fields we'll allow the user to update via the update endpoint
// Essentially these are the real-time use and customisation fields

/**
 * Hard coding of the base device fields the user is allowed to update via the update endpoint
 */
export const updateableBaseFields = ["deviceName", "isPowered"];

/**
 * Hard coding of the Light device fields the user is allowed to update via the update endpoint
 */
export const updateableLightFields = ["colour", "intensity"];

/**
 * Hard coding of the Carbon Monitor device fields the user is allowed to update via the update endpoint
 */
export const updateableMonitorFields = ["alarmThreshold"];

/**
 * Maps the device category to the updatable field array
 */
export const categoryUpdatableFields: Record<string, any[]> = {
  Light: updateableLightFields,
  CarbonMonitor: updateableMonitorFields,
};
