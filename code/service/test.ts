import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { DeviceRegistrationApiRes } from '../models/api/device-registration-api-res.model';
import { DeviceRegistrationApiReq } from '../models/api/device-registration-api-req.model';
import { CpxHttpClientService } from './cpx-http-client.service';
import { DeviceIdService } from './device-id.service';
import { RSAKeyService } from './rsa-key.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceRegistrationApiService {
  private deviceRegistrationAttempt = 0; // Tracks the number of registration attempts
  private DEVICE_REGISTRATION_API_END_POINT = '/launch-openaccount/services/session-dialogue/onboarding-journey/registered-device';

  constructor(
    private cpxHttpService: CpxHttpClientService, // Custom HTTP client service for handling requests
    private deviceIdService: DeviceIdService,      // Service to retrieve the device ID
    private rsaKeyService: RSAKeyService           // Service to manage RSA key generation and retrieval
  ) {}

  /**
   * Initiates the device registration process.
   * If the device is already registered, it retries registration with a new key pair.
   */
  registerDevice(): Observable<HttpResponse<DeviceRegistrationApiRes>> {
    return this.sendDeviceRegistrationRequest().pipe(
      switchMap((response) => this.handleDeviceAlreadyRegistered(response)),
      catchError((error) => this.handleError(error)) // Handle errors if any occur during registration
    );
  }

  /**
   * Sends a device registration request.
   */
  private sendDeviceRegistrationRequest(): Observable<HttpResponse<DeviceRegistrationApiRes>> {
    return this.cpxHttpService.post<DeviceRegistrationApiRes>(
      this.DEVICE_REGISTRATION_API_END_POINT,
      this.generateRequest()
    );
  }

  /**
   * Handles the case where the device is already registered.
   * If registered, generates a new key pair and retries registration.
   * @param response The response from the initial registration attempt.
   */
  private handleDeviceAlreadyRegistered(response: HttpResponse<DeviceRegistrationApiRes>): Observable<HttpResponse<DeviceRegistrationApiRes>> {
    if (this.isDeviceAlreadyRegistered(response)) {
      this.retryDeviceRegistration();
      return this.sendDeviceRegistrationRequest();
    }
    return of(response); // Return the original response if device is not already registered
  }

  /**
   * Checks if the device is already registered based on response status and attempt count.
   */
  private isDeviceAlreadyRegistered(response: HttpResponse<DeviceRegistrationApiRes>): boolean {
    return this.deviceRegistrationAttempt++ > 0 && response.body?.status === 'Device Already Registered';
  }

  /**
   * Generates a new RSA key pair for retrying device registration.
   */
  private retryDeviceRegistration(): void {
    this.rsaKeyService.generateKeyPair();
  }

  /**
   * Custom error handling for registration errors.
   * @param error The error object caught during registration.
   */
  private handleError(error: any): Observable<never> {
    throw error; // Re-throw the error to propagate it further
  }

  /**
   * Generates the registration request object containing device ID and public key.
   */
  private generateRequest(): DeviceRegistrationApiReq {
    const deviceId = this.deviceIdService.getDeviceId();
    const publicKey = this.rsaKeyService.getPublicKey();

    return { deviceId, publicKey };
  }
}


---------------


import { TestBed } from '@angular/core/testing';
import { DeviceRegistrationApiService } from './device-registration-api.service';
import { CpxHttpClientService } from './cpx-http-client.service';
import { DeviceIdService } from './device-id.service';
import { RSAKeyService } from './rsa-key.service';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
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
    const mockResponse = new HttpResponse<DeviceRegistrationApiRes>({ body: { status: 'Success' } });
    cpxHttpService.post.mockReturnValue(of(mockResponse));

    service.registerDevice().subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(cpxHttpService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should retry registration when device is already registered', (done) => {
    const mockAlreadyRegisteredResponse = new HttpResponse<DeviceRegistrationApiRes>({ body: { status: 'Device Already Registered' } });
    const mockSuccessResponse = new HttpResponse<DeviceRegistrationApiRes>({ body: { status: 'Success' } });
    cpxHttpService.post.mockReturnValueOnce(of(mockAlreadyRegisteredResponse)).mockReturnValueOnce(of(mockSuccessResponse));

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
    const response = new HttpResponse<DeviceRegistrationApiRes>({ body: { status: 'Device Already Registered' } });
    expect(service['isDeviceAlreadyRegistered'](response)).toBe(true);
  });
});
