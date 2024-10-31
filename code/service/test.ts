import { TestBed } from '@angular/core/testing';
import { LetsGetStartedComponent } from './lets-get-started.component';
import { of, throwError } from 'rxjs';

// Mock services
const appConfigServiceMock = { init: jest.fn() };
const deviceIdServiceMock = { initialize: jest.fn(), getDeviceId: jest.fn().mockReturnValue('testDeviceId') };
const rsaKeyServiceMock = { generateKeyPair: jest.fn().mockResolvedValue({ publicKey: 'testPublicKey', privateKey: 'testPrivateKey' }) };
const launchPermanentStorageServiceMock = { setStringValue: jest.fn() };
const deviceRegistrationApiServiceMock = { registerDevice: jest.fn() };
const navigationServiceMock = { init: jest.fn() };

describe('LetsGetStartedComponent', () => {
  let component: LetsGetStartedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LetsGetStartedComponent,
        { provide: 'AppConfigService', useValue: appConfigServiceMock },
        { provide: 'DeviceIdService', useValue: deviceIdServiceMock },
        { provide: 'RSAKeyService', useValue: rsaKeyServiceMock },
        { provide: 'LaunchPermanentStorageService', useValue: launchPermanentStorageServiceMock },
        { provide: 'DeviceRegistrationApiService', useValue: deviceRegistrationApiServiceMock },
        { provide: 'NavigationService', useValue: navigationServiceMock },
      ],
    });

    component = TestBed.inject(LetsGetStartedComponent);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('ngOnInit', () => {
    it('should initialize configuration, device ID, and RSA keys, and register device', async () => {
      jest.spyOn(component, 'generateRSAKeys').mockResolvedValue();
      jest.spyOn(component, 'registerDevice').mockImplementation();

      await component.ngOnInit();

      expect(appConfigServiceMock.init).toHaveBeenCalled();
      expect(deviceIdServiceMock.initialize).toHaveBeenCalled();
      expect(component.generateRSAKeys).toHaveBeenCalled();
      expect(component.registerDevice).toHaveBeenCalled();
      expect(navigationServiceMock.init).toHaveBeenCalledWith('CheckingAccount');
    });
  });

  describe('generateRSAKeys', () => {
    it('should generate RSA keys and store them in permanent storage', async () => {
      await component.generateRSAKeys();

      expect(rsaKeyServiceMock.generateKeyPair).toHaveBeenCalled();
      expect(launchPermanentStorageServiceMock.setStringValue).toHaveBeenCalledWith('RSA_PRIVATE_KEY', 'testPrivateKey');
      expect(launchPermanentStorageServiceMock.setStringValue).toHaveBeenCalledWith('RSA_PUBLIC_KEY', 'testPublicKey');
    });

    it('should handle errors when generating RSA keys', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      rsaKeyServiceMock.generateKeyPair.mockRejectedValue(new Error('Failed to generate keys'));

      await component.generateRSAKeys();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error generating RSA keys:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('registerDevice', () => {
    it('should register the device and store UUID if registration is successful', () => {
      const mockResponse = { body: { uuid: 'testUUID' } };
      deviceRegistrationApiServiceMock.registerDevice.mockReturnValue(of(mockResponse));

      component.registerDevice();

      expect(deviceRegistrationApiServiceMock.registerDevice).toHaveBeenCalled();
      expect(launchPermanentStorageServiceMock.setStringValue).toHaveBeenCalledWith('UUID', 'testUUID');
      expect(console.log).toHaveBeenCalledWith('Device registered with UUID:', 'testUUID');
    });

    it('should handle errors when registering the device', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      deviceRegistrationApiServiceMock.registerDevice.mockReturnValue(throwError(() => new Error('Registration failed')));

      component.registerDevice();

      expect(deviceRegistrationApiServiceMock.registerDevice).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error registering device:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});
