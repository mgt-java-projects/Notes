import { TestBed } from '@angular/core/testing';
import { DeviceRegistrationApiService } from './device-registration-api.service';
import { CpxHttpClientService } from './cpx-http-client.service';
import { DeviceIdService } from './device-id.service';
import { RSAKeyService } from './rsa-key.service';
import { of, throwError } from 'rxjs';
import { DeviceRegistrationApiRes } from '../models/api/device-registration-api-res.model';

describe('DeviceRegistrationApiService', () => {
  let service: DeviceRegistrationApiService;
  let cpxHttpService: jest.Mocked<CpxHttpClientService>;
  let deviceIdService: jest.Mocked<DeviceIdService>;
  let rsaKeyService: jest.Mocked<RSAKeyService>;

  beforeEach(() => {
    const cpxHttpServiceMock = {
      post: jest.fn()
    };
    const deviceIdServiceMock = {
      getDeviceId: jest.fn().mockReturnValue('testDeviceId')
    };
    const rsaKeyServiceMock = {
      getPublicKey: jest.fn().mockReturnValue('testPublicKey'),
      generateKeyPair: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        DeviceRegistrationApiService,
        { provide: CpxHttpClientService, useValue: cpxHttpServiceMock },
        { provide: DeviceIdService, useValue: deviceIdServiceMock },
        { provide: RSAKeyService, useValue: rsaKeyServiceMock }
      ]
    });

    service = TestBed.inject(DeviceRegistrationApiService);
    cpxHttpService = TestBed.inject(CpxHttpClientService) as jest.Mocked<CpxHttpClientService>;
    deviceIdService = TestBed.inject(DeviceIdService) as jest.Mocked<DeviceIdService>;
    rsaKeyService = TestBed.inject(RSAKeyService) as jest.Mocked<RSAKeyService>;
  });

  it('should create service instance', () => {
    expect(service).toBeTruthy();
  });

  it('should successfully register a device on first attempt', (done) => {
    const mockResponse: HttpResponse<DeviceRegistrationApiRes> = { body: { status: 'Success' } };
    cpxHttpService.post.mockReturnValue(of(mockResponse));

    service.registerDevice().subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(cpxHttpService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should retry registration when device is already registered', (done) => {
    const mockAlreadyRegisteredResponse: HttpResponse<DeviceRegistrationApiRes> = { body: { status: 'Device Already Registered' } };
    const mockSuccessResponse: HttpResponse<DeviceRegistrationApiRes> = { body: { status: 'Success' } };
    
    cpxHttpService.post
      .mockReturnValueOnce(of(mockAlreadyRegisteredResponse))
      .mockReturnValueOnce(of(mockSuccessResponse));

    service.registerDevice().subscribe((response) => {
      expect(response).toEqual(mockSuccessResponse);
      expect(cpxHttpService.post).toHaveBeenCalledTimes(2);
      expect(rsaKeyService.generateKeyPair).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should propagate error on registration failure', (done) => {
    const mockError = new Error('Registration failed');
    cpxHttpService.post.mockReturnValue(throwError(() => mockError));

    service.registerDevice().subscribe({
      next: () => {},
      error: (error) => {
        expect(error).toBe(mockError);
        expect(cpxHttpService.post).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should call generateRequest to get deviceId and publicKey', () => {
    const request = service['generateRequest']();
    expect(request.deviceId).toBe('testDeviceId');
    expect(request.publicKey).toBe('testPublicKey');
  });

  it('should check if device is already registered', () => {
    const response: HttpResponse<DeviceRegistrationApiRes> = { body: { status: 'Device Already Registered' } };
    expect(service['isDeviceAlreadyRegistered'](response)).toBe(true);
  });
});
