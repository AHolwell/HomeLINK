import { describe, it, expect, vi } from 'vitest';
import { constructUpdateExpressions, createDevice, getDeviceType, getUpdatableFields, validateBody } from '..';
import { APIGatewayProxyEvent } from "aws-lambda";
import { deviceFactories } from '../device-factory';
import { updateableBaseFields, updateableLightFields, updateableMonitorFields, categoryUpdatableFields } from '../types';

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

describe('getUpdatableFields', () => {
  it.each([
    {
      deviceCategory: 'Light',
      expectedFields: [...updateableBaseFields, ...updateableLightFields],
    },
    {
      deviceCategory: 'CarbonMonitor',
      expectedFields: [...updateableBaseFields, ...updateableMonitorFields],
    },
  ])('should return the correct updatable fields for $deviceCategory', ({ deviceCategory, expectedFields }) => {
    const result = getUpdatableFields(deviceCategory);
    expect(result).toEqual(expectedFields);
  });

  it('should throw an error for an unknown device category', () => {
    expect(() => getUpdatableFields('UnknownCategory')).toThrow();
  });
});

describe('constructUpdateExpressions', () => {
  it('should return valid update expressions for allowed fields', () => {
    const allowedFields = ['field1', 'field2'];
    const bodyString = JSON.stringify({
      field1: 'value1',
      field2: 'value2',
    });

    const result = constructUpdateExpressions(allowedFields, bodyString);

    expect(result.updateExpression.trim()).toBe('SET field1 = :field1 field2 = :field2');
    expect(result.expressionAttributeValues).toEqual({
      ':field1': 'value1',
      ':field2': 'value2',
    });
  });

  it('should throw an error if there are invalid fields', () => {
    const allowedFields = ['field1'];
    const bodyString = JSON.stringify({
      field1: 'value1',
      invalidField: 'value2',
    });

    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      'You cannot update the following fields: invalidField'
    );
  });

  it('should return an empty update expression if the body is empty', () => {
    const allowedFields = ['field1', 'field2'];
    const bodyString = JSON.stringify({});

    const result = constructUpdateExpressions(allowedFields, bodyString);

    expect(result.updateExpression.trim()).toBe('SET');
    expect(result.expressionAttributeValues).toEqual({});
  });

  it('should handle body with only invalid fields', () => {
    const allowedFields = ['field1'];
    const bodyString = JSON.stringify({
      invalidField1: 'value1',
      invalidField2: 'value2',
    });

    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      'You cannot update the following fields: invalidField1, invalidField2'
    );
  });

  it('should throw an error if bodyString is not valid JSON', () => {
    const allowedFields = ['field1'];
    const bodyString = "invalid_json";

    expect(() => constructUpdateExpressions(allowedFields, bodyString)).toThrow(
      "Unexpected token 'i', \"invalid_json\" is not valid JSON"
    );
  });
});