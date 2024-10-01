import { Injectable } from '@angular/core';
import { HttpService } from './http.service'; // Import your common HTTP service
import { DeviceIdService } from './device-id.service'; // Import your Device ID service
import { RSAKeyService } from './rsa-key.service'; // Import your RSA key service
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeviceRegistrationService {

  constructor(
    private httpService: HttpService,
    private deviceIdService: DeviceIdService,
    private rsaKeyService: RSAKeyService
  ) {}

  /**
   * Register a device with its ID and public key.
   * @returns Observable containing the response with the UUID.
   */
  registerDevice(): Observable<{ uuid: string }> {
    // Get the device ID and public key
    const deviceId = this.deviceIdService.getDeviceId();
    const publicKey = this.rsaKeyService.getPublicKey();

    // Create the registration request
    const request = {
      deviceid: deviceId,
      publickey: publicKey
    };

    // Call the common HTTP service and return the observable
    return this.httpService.post<{ uuid: string }>('/api/register-device', request).pipe(
      tap({
        next: (response) => {
          console.log('Device registered successfully:', response);
        },
        error: (error) => {
          console.error('Error registering device:', error);
        }
      }),
      catchError((error) => {
        console.error('Caught error:', error);
        throw error; // Propagate the error
      })
    );
  }
}
-------------------
import { TestBed } from '@angular/core/testing';
import { DeviceRegistrationService } from './device-registration.service';
import { HttpService } from './http.service';
import { DeviceIdService } from './device-id.service';
import { RSAKeyService } from './rsa-key.service';
import { of, throwError } from 'rxjs';

describe('DeviceRegistrationService', () => {
  let service: DeviceRegistrationService;
  let httpService: jasmine.SpyObj<HttpService>;
  let deviceIdService: jasmine.SpyObj<DeviceIdService>;
  let rsaKeyService: jasmine.SpyObj<RSAKeyService>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['post']);
    const deviceIdSpy = jasmine.createSpyObj('DeviceIdService', ['getDeviceId']);
    const rsaKeySpy = jasmine.createSpyObj('RSAKeyService', ['getPublicKey']);

    TestBed.configureTestingModule({
      providers: [
        DeviceRegistrationService,
        { provide: HttpService, useValue: httpSpy },
        { provide: DeviceIdService, useValue: deviceIdSpy },
        { provide: RSAKeyService, useValue: rsaKeySpy }
      ]
    });

    service = TestBed.inject(DeviceRegistrationService);
    httpService = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    deviceIdService = TestBed.inject(DeviceIdService) as jasmine.SpyObj<DeviceIdService>;
    rsaKeyService = TestBed.inject(RSAKeyService) as jasmine.SpyObj<RSAKeyService>;
  });

  it('should register the device and return the UUID', () => {
    const mockDeviceId = 'mock-device-id';
    const mockPublicKey = 'mock-public-key';
    const mockResponse = { uuid: 'mock-uuid' };

    // Set up spies
    deviceIdService.getDeviceId.and.returnValue(mockDeviceId);
    rsaKeyService.getPublicKey.and.returnValue(mockPublicKey);
    httpService.post.and.returnValue(of(mockResponse));

    // Call the method and assert the result
    service.registerDevice().subscribe({
      next: (response) => {
        expect(response.uuid).toBe('mock-uuid');
      },
      error: () => {
        fail('Expected successful registration, but got an error.');
      }
    });

    // Check if the HTTP service was called with the correct URL and payload
    expect(httpService.post).toHaveBeenCalledWith('/api/register-device', {
      deviceid: mockDeviceId,
      publickey: mockPublicKey
    });
  });

  it('should handle error when registering the device', () => {
    const mockDeviceId = 'mock-device-id';
    const mockPublicKey = 'mock-public-key';
    const mockError = { message: 'Network error' };

    // Set up spies
    deviceIdService.getDeviceId.and.returnValue(mockDeviceId);
    rsaKeyService.getPublicKey.and.returnValue(mockPublicKey);
    httpService.post.and.returnValue(throwError(() => mockError));

    // Call the method and assert the result
    service.registerDevice().subscribe({
      next: () => {
        fail('Expected an error, but got a successful response.');
      },
      error: (error) => {
        expect(error).toEqual(mockError);
      }
    });
  });
});

---------------
import { Component } from '@angular/core';
import { DeviceRegistrationService } from './device-registration.service';

@Component({
  selector: 'app-device-registration',
  templateUrl: './device-registration.component.html'
})
export class DeviceRegistrationComponent {

  constructor(private deviceRegistrationService: DeviceRegistrationService) {}

  /**
   * Method to register the device when the button is clicked.
   */
  registerDevice(): void {
    this.deviceRegistrationService.registerDevice().subscribe({
      next: (response) => {
        console.log('Device registered with UUID:', response.uuid);
      },
      error: (error) => {
        console.error('Error registering device:', error);
      }
    });
  }
}
