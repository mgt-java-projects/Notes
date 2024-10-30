import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DeviceRegistrationApiService } from './device-registration-api.service';
import { CpxHttpClientService } from '../path-to-cpx-http-client-service';
import { DeviceIdService } from '../path-to-device-id-service';
import { RSAKeyService } from '../path-to-rsa-key-service';
import { DeviceRegistrationApiReq } from '../models/api/device-registration-api-res.model';

describe('DeviceRegistrationApiService', () => {
  let service: DeviceRegistrationApiService;
  let httpClientMock: jest.Mocked<CpxHttpClientService>;
  let deviceIdServiceMock: jest.Mocked<DeviceIdService>;
  let rsaKeyServiceMock: jest.Mocked<RSAKeyService>;

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn(),
    } as unknown as jest.Mocked<CpxHttpClientService>;

    deviceIdServiceMock = {
      getDeviceId: jest.fn(),
    } as unknown as jest.Mocked<DeviceIdService>;

    rsaKeyServiceMock = {
      generateKeyPair: jest.fn(),
      getPublicKey: jest.fn(),
    } as unknown as jest.Mocked<RSAKeyService>;

    TestBed.configureTestingModule({
      providers: [
        DeviceRegistrationApiService,
        { provide: CpxHttpClientService, useValue: httpClientMock },
        { provide: DeviceIdService, useValue: deviceIdServiceMock },
        { provide: RSAKeyService, useValue: rsaKeyServiceMock },
      ],
    });

    service = TestBed.inject(DeviceRegistrationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerDevice', () => {
    it('should register the device when it is not already registered', (done) => {
      const mockResponse = { body: { status: 'Device Not Registered' } };
      httpClientMock.post.mockReturnValueOnce(of(mockResponse));
      deviceIdServiceMock.getDeviceId.mockReturnValue('mockDeviceId');
      rsaKeyServiceMock.getPublicKey.mockReturnValue('mockPublicKey');

      service.registerDevice().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(httpClientMock.post).toHaveBeenCalledTimes(2);
        expect(rsaKeyServiceMock.generateKeyPair).toHaveBeenCalled();
        done();
      });
    });

    it('should not register the device if already registered', (done) => {
      const alreadyRegisteredResponse = { body: { status: 'Device Already Registered' } };
      httpClientMock.post.mockReturnValueOnce(of(alreadyRegisteredResponse));

      service.registerDevice().subscribe((response) => {
        expect(response).toEqual(alreadyRegisteredResponse);
        expect(httpClientMock.post).toHaveBeenCalledTimes(1);
        expect(rsaKeyServiceMock.generateKeyPair).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle an error if post request fails', (done) => {
      const errorResponse = new Error('Network error');
      httpClientMock.post.mockReturnValueOnce(throwError(errorResponse));

      service.registerDevice().subscribe({
        error: (error) => {
          expect(error).toBe(errorResponse);
          expect(httpClientMock.post).toHaveBeenCalledTimes(1);
          done();
        },
      });
    });
  });

  describe('generateRequest', () => {
    it('should create a valid request object', () => {
      const mockDeviceId = 'mockDeviceId';
      const mockPublicKey = 'mockPublicKey';

      deviceIdServiceMock.getDeviceId.mockReturnValue(mockDeviceId);
      rsaKeyServiceMock.getPublicKey.mockReturnValue(mockPublicKey);

      const request = service['generateRequest']();

      expect(request).toEqual({
        deviceId: mockDeviceId,
        publicKey: mockPublicKey,
      });
      expect(deviceIdServiceMock.getDeviceId).toHaveBeenCalled();
      expect(rsaKeyServiceMock.getPublicKey).toHaveBeenCalled();
    });

    it('should handle empty deviceId and publicKey gracefully', () => {
      deviceIdServiceMock.getDeviceId.mockReturnValue('');
      rsaKeyServiceMock.getPublicKey.mockReturnValue('');

      const request = service['generateRequest']();

      expect(request).toEqual({
        deviceId: '',
        publicKey: '',
      });
      expect(deviceIdServiceMock.getDeviceId).toHaveBeenCalled();
      expect(rsaKeyServiceMock.getPublicKey).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should retry registration if attempt fails once', (done) => {
      const mockResponse = { body: { status: 'Device Not Registered' } };
      httpClientMock.post
        .mockReturnValueOnce(throwError(new Error('First attempt failed')))
        .mockReturnValueOnce(of(mockResponse));

      service.registerDevice().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(httpClientMock.post).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should stop retrying after two attempts if the response is still an error', (done) => {
      const errorResponse = new Error('Persistent error');
      httpClientMock.post.mockReturnValue(throwError(errorResponse));

      service.registerDevice().subscribe({
        error: (error) => {
          expect(error).toBe(errorResponse);
          expect(httpClientMock.post).toHaveBeenCalledTimes(2);
          done();
        },
      });
    });
  });
});
