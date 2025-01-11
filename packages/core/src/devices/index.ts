import { APIGatewayProxyEvent } from "aws-lambda";
import { Device, deviceFactories } from "./device-factory";

export type EventBody = {
    deviceName?: string
    modelType: string
}

export const createDevice = <T extends Device>(event: APIGatewayProxyEvent): T => {
    try {
        const body: EventBody = validateBody(event)

        const factory = deviceFactories[getDeviceType(body.modelType)]
        return factory(event, body) as T

    } catch (error: any) {
        throw new Error(`Error creating device - ${error}`)
    }
}

export const getDeviceType = (modelType: string) => {
    // In a use real case I would opt for a centrally managed mapping system/single source of truth - presumably we'd have a database of different devices and models that we could use for lookup.
    // Though hard codeing here works for PoC/demonstration purposes
    switch (modelType) {
        // Light model Types
        case "LED":
        case "Flourescent":
            return "Light"
        // Monitor model types
        case "CO":
        case "CO":
            return "CarbonMonitor"
        // No match
        default:
            throw new Error(`"${modelType}" is not a supported model type`)
    }
}

export const validateBody = (event: APIGatewayProxyEvent): EventBody => {
    if (!event?.body || event.body == '') {
        throw new Error('No body in event')
    }
    const body = JSON.parse(event.body)
    if (!body.modelType) {
        throw new Error('No model type was provided')
    }
    return body
}