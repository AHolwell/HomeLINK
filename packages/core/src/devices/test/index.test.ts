import { describe, it, expect, vi } from 'vitest';
import { createDevice, getDeviceType, validateBody } from '..';
import { APIGatewayProxyEvent } from "aws-lambda";
import { deviceFactories } from '../device-factory';
  
describe('getDeviceType', () => {
    // Valid test cases using each
    it.each([
        ["LED", "Light"],
        ["Flourescent", "Light"],
        ["CO", "CarbonMonitor"]
    ])('should return correct device type for %s model type', (modelType, expected) => {
        expect(getDeviceType(modelType)).toBe(expected);
    });

    // Invalid test cases
    it.each([
        ["Smartphone", '"Smartphone" is not a supported model type'],
        ["", '"" is not a supported model type'],
        [undefined, '"undefined" is not a supported model type'],
        [null, '"null" is not a supported model type']
    ])('should throw an error for invalid model type: %s', (modelType, expectedError) => {
        expect(() => getDeviceType(modelType as unknown as string)).toThrowError(expectedError);
    });
});

describe('validateBody', () => {
    // Valid test case using each
    it.each([
      ['{"modelType": "LED"}', { modelType: "LED" }],
      ['{"modelType": "Fluorescent"}', { modelType: "Fluorescent" }],
      ['{"modelType": "CO"}', { modelType: "CO" }]
    ])('should return the body for valid event with body: %s', (eventBody, expected) => {
      const event: APIGatewayProxyEvent = {
        body: eventBody,
        // Other properties of the event can be mocked if needed
      } as unknown as APIGatewayProxyEvent;
  
      expect(validateBody(event)).toEqual(expected);
    });
  
    // Invalid test cases using each
    it.each([
      [null, 'No body in event'],
      ['', 'No body in event'],
      [undefined, 'No body in event'],
      ['{"modelType": ""}', 'No model type was provided'],
      ['{}', 'No model type was provided']
    ])('should throw an error for invalid event with body: %s', (eventBody, expectedError) => {
      const event: APIGatewayProxyEvent = {
        body: eventBody,
        // Other properties of the event can be mocked if needed
      } as unknown as APIGatewayProxyEvent;
  
      expect(() => validateBody(event)).toThrowError(expectedError);
    });
  });