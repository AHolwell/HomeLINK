import { describe, it, expect, vi, afterEach } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda'; 
import * as uuid from 'uuid';
import { deviceFactories } from '../device-factory';

describe('deviceFactories', () => {
  const uuidMock = vi.spyOn(uuid, 'v1').mockReturnValue('12345-abcde');

  const dateNowMock = vi.spyOn(Date, 'now').mockReturnValue(10);

  // Mock event and body for testing
  const mockEvent: APIGatewayProxyEvent = {
    requestContext: {
      authorizer: {
        iam: {
          cognitoIdentity: {
            identityId: 'test-identity-id'
          }
        }
      }
    },
    body: JSON.stringify({ modelType: 'Light', deviceName: 'Test Light' }),
  } as unknown as APIGatewayProxyEvent;

  const mockBody = {
    modelType: 'Light',
    deviceName: 'Test Light',
  };

  it('should create a Light device with correct fields', () => {
    const lightDevice = deviceFactories['Light'](mockEvent, mockBody);

    expect(lightDevice).toEqual({
      userId: 'test-identity-id',
      deviceId: '12345-abcde',
      deviceCategory: 'Light',
      reigisteredAt: 10,
      deviceName: 'Test Light',
      isPowered: true,
      modelType: 'Light',
      colour: 'White',
      intensity: 100,
    });
  });

  it('should create a CarbonMonitor device with correct fields', () => {
    const carbonMonitorBody = {
      modelType: 'CarbonMonitor',
      deviceName: 'Test Monitor',
    };
    const carbonMonitorDevice = deviceFactories['CarbonMonitor'](mockEvent, carbonMonitorBody);

    expect(carbonMonitorDevice).toEqual({
      userId: 'test-identity-id',
      deviceId: '12345-abcde',
      deviceCategory: 'CarbonMonitor',
      reigisteredAt: 10,
      deviceName: 'Test Monitor',
      isPowered: true,
      modelType: 'CarbonMonitor',
      alarmThreshold: 220,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
