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
  let httpServiceMock: jest.Mocked<HttpService>;
  let deviceIdServiceMock: jest.Mocked<DeviceIdService>;
  let rsaKeyServiceMock: jest.Mocked<RSAKeyService>;

  beforeEach(() => {
    // Mock services
    httpServiceMock = {
      post: jest.fn()
    } as any;

    deviceIdServiceMock = {
      getDeviceId: jest.fn().mockReturnValue('mock-device-id')
    } as any;

    rsaKeyServiceMock = {
      getPublicKey: jest.fn().mockReturnValue('mock-public-key')
    } as any;

    TestBed.configureTestingModule({
      providers: [
        DeviceRegistrationService,
        { provide: HttpService, useValue: httpServiceMock },
        { provide: DeviceIdService, useValue: deviceIdServiceMock },
        { provide: RSAKeyService, useValue: rsaKeyServiceMock }
      ]
    });

    service = TestBed.inject(DeviceRegistrationService);
  });

  it('should register the device and return uuid', (done) => {
    const mockResponse = { uuid: '1234-5678' };
    httpServiceMock.post.mockReturnValue(of(mockResponse));

    service.registerDevice().subscribe({
      next: (result) => {
        expect(result.uuid).toBe('1234-5678');
        expect(httpServiceMock.post).toHaveBeenCalledWith('/api/register-device', {
          deviceid: 'mock-device-id',
          publickey: 'mock-public-key'
        });
        done();
      },
      error: done.fail
    });
  });

  it('should handle error on device registration', (done) => {
    const errorResponse = new Error('Registration failed');
    httpServiceMock.post.mockReturnValue(throwError(() => errorResponse));

    service.registerDevice().subscribe({
      next: () => done.fail('Expected an error, but got success'),
      error: (error) => {
        expect(error).toBe(errorResponse);
        done();
      }
    });
  });

  it('should call getDeviceId and getPublicKey once', () => {
    service.registerDevice();
    expect(deviceIdServiceMock.getDeviceId).toHaveBeenCalledTimes(1);
    expect(rsaKeyServiceMock.getPublicKey).toHaveBeenCalledTimes(1);
  });

  it('should call HTTP post with correct URL', (done) => {
    const mockResponse = { uuid: 'uuid-value' };
    httpServiceMock.post.mockReturnValue(of(mockResponse));

    service.registerDevice().subscribe({
      next: () => {
        expect(httpServiceMock.post).toHaveBeenCalledWith('/api/register-device', {
          deviceid: 'mock-device-id',
          publickey: 'mock-public-key'
        });
        done();
      },
      error: done.fail
    });
  });

  it('should throw an error if HTTP post fails', (done) => {
    const errorResponse = new Error('Network Error');
    httpServiceMock.post.mockReturnValue(throwError(() => errorResponse));

    service.registerDevice().subscribe({
      next: () => done.fail('Expected an error, but got success'),
      error: (error) => {
        expect(error).toBe(errorResponse);
        done();
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
