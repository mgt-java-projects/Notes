import { TestBed } from '@angular/core/testing';
import { IsamRefreshSessionTokenService } from './wasam-refresh-session-token.service';
import { SessionTokenStorageService } from './session-token-storage.service';
import { CpxHttpClientService } from '../http-client.service';
import { EnvironmentService } from '../infra/environment.service';
import { PlatformInfoService } from '@bmo/freddy/platform/info/';
import { of, throwError } from 'rxjs';

describe('IsamRefreshSessionTokenService', () => {
  let service: IsamRefreshSessionTokenService;
  let sessionTokenStorageService: jest.Mocked<SessionTokenStorageService>;
  let cpxHttpClientService: jest.Mocked<CpxHttpClientService>;
  let environmentService: jest.Mocked<EnvironmentService>;
  let platformInfoService: jest.Mocked<PlatformInfoService>;

  beforeEach(() => {
    sessionTokenStorageService = {
      getSessionTokenDetails: jest.fn(),
      saveSessionTokenDetails: jest.fn(),
    } as unknown as jest.Mocked<SessionTokenStorageService>;

    cpxHttpClientService = {
      post: jest.fn(),
    } as unknown as jest.Mocked<CpxHttpClientService>;

    environmentService = {
      getIsamHost: jest.fn(),
    } as unknown as jest.Mocked<EnvironmentService>;

    platformInfoService = {
      isAndroid: false,
      isNative: false,
    } as unknown as jest.Mocked<PlatformInfoService>;

    TestBed.configureTestingModule({
      providers: [
        IsamRefreshSessionTokenService,
        { provide: SessionTokenStorageService, useValue: sessionTokenStorageService },
        { provide: CpxHttpClientService, useValue: cpxHttpClientService },
        { provide: EnvironmentService, useValue: environmentService },
        { provide: PlatformInfoService, useValue: platformInfoService },
      ],
    });

    service = TestBed.inject(IsamRefreshSessionTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getValidRefreshToken', () => {
    it('should return refresh token if available', () => {
      sessionTokenStorageService.getSessionTokenDetails.mockReturnValue({
        refreshToken: 'test-refresh-token',
      });

      expect(service.getValidRefreshToken()).toBe('test-refresh-token');
    });

    it('should throw an error if no refresh token is available', () => {
      sessionTokenStorageService.getSessionTokenDetails.mockReturnValue(null);
      expect(() => service.getValidRefreshToken()).toThrow('No valid session token available for refreshing');
    });
  });

  describe('getRedirectUri', () => {
    it('should return Android redirect URL if platform is Android', () => {
      platformInfoService.isAndroid = true;
      expect(service.getRedirectUri()).toBe('https://mb.com/l');
    });

    it('should return iOS redirect URL if platform is not Android', () => {
      platformInfoService.isAndroid = false;
      expect(service.getRedirectUri()).toBe('capacitor://mb.com/l');
    });
  });

  describe('getIsamHost', () => {
    it('should return ISAM host if platform is native', () => {
      platformInfoService.isNative = true;
      environmentService.getIsamHost.mockReturnValue('https://wasam.host');
      expect(service.getIsamHost()).toBe('https://wasam.host');
    });

    it('should return an empty string if platform is not native', () => {
      platformInfoService.isNative = false;
      expect(service.getIsamHost()).toBe('');
    });
  });

  describe('refreshSessionTokenCall', () => {
    it('should successfully call the refresh token API and return token data', (done) => {
      cpxHttpClientService.post.mockReturnValue(
        of({
          body: { access_token: 'new-access-token', refresh_token: 'new-refresh-token' },
        })
      );

      service.refreshSessionTokenCall('test-refresh-token').subscribe((response) => {
        expect(response.access_token).toBe('new-access-token');
        done();
      });
    });

    it('should throw an error if API response is invalid', (done) => {
      cpxHttpClientService.post.mockReturnValue(of({ body: {} }));

      service.refreshSessionTokenCall('test-refresh-token').subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to refresh session tokens');
          done();
        },
      });
    });

    it('should increment refresh_Attempt_Count on each call', () => {
      expect(service['refresh_Attempt_Count']).toBe(0);
      cpxHttpClientService.post.mockReturnValue(of({ body: { access_token: 'token' } }));

      service.refreshSessionTokenCall('test-refresh-token').subscribe(() => {
        expect(service['refresh_Attempt_Count']).toBe(1);
      });
    });
  });

  describe('startRefreshTokenLogic', () => {
    it('should start refresh token logic if token is available', () => {
      sessionTokenStorageService.getSessionTokenDetails.mockReturnValue({
        refreshToken: 'test-refresh-token',
      });

      jest.spyOn(service, 'refreshSessionTokenCall').mockReturnValue(
        of({ access_token: 'new-access-token', refresh_token: 'new-refresh-token' })
      );

      service.startRefreshTokenLogic();

      expect(sessionTokenStorageService.getSessionTokenDetails).toHaveBeenCalled();
      expect(service.refreshSessionTokenCall).toHaveBeenCalled();
    });

    it('should throw an error if no valid session token is available', () => {
      sessionTokenStorageService.getSessionTokenDetails.mockReturnValue(null);

      expect(() => service.startRefreshTokenLogic()).toThrow('No valid session token available for refreshing');
    });
  });

  describe('stopRefreshTokenLogic', () => {
    it('should unsubscribe from refreshTokenTimerSubscription if it exists', () => {
      service['refreshTokenTimerSubscription'] = { unsubscribe: jest.fn() } as unknown as Subscription;
      service.stopRefreshTokenLogic();
      expect(service['refreshTokenTimerSubscription']).toBeNull();
    });

    it('should do nothing if refreshTokenTimerSubscription is null', () => {
      service['refreshTokenTimerSubscription'] = null;
      expect(() => service.stopRefreshTokenLogic()).not.toThrow();
    });
  });
});
