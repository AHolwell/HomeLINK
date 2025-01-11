export type BaseDevice = {
    userId: string
    deviceId: string
    reigisteredAt: number
    deviceName?: string //Option for user to give device a name
    isPowered: boolean
    deviceCategory: string
}

export type Light = BaseDevice & {
    modelType: string // User Given
    colour: string
    intensity: number
}

export type CarbonMonitor = BaseDevice & {
    modelType: string // User Given
    alarmThreshold: number
}



export type Device = Light | CarbonMonitor

export const updateableBaseFields = ["deviceName", "isPowered"]
export const updateableLightFields = ["colour", "intensity"]
export const updateableMonitorFields = ["alarmThreshold"]

export const categoryUpdatableFields: Record<string, any[]> = {
    Light: updateableLightFields,
    CarbonMonitor: updateableMonitorFields,
};