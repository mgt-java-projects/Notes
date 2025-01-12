import { Injectable } from '@angular/core';
import { CodeChallengeService } from './code-challenge.service';
import { JwtService } from './jwt.service';
import { SessionTokenStorageService } from './session-token-storage.service';
import { Observable, throwError, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { CpxHttpClientService } from './cpx-http-client.service';
import { HttpClientParams } from './cpx-http-client.model';
import { RSAKeyService } from './rsa-key.service';
import { PlatformInfoService } from '@abc/reddy/platforminfo';
import { EnvironmentService } from '../infra/environment.service';

/**
 * WASAM fresh token creation service.
 */
@Injectable({
  providedIn: 'root',
})
export class WasamNewSessionCreationService {
  //Todo move clientId, client secret to app config
  private readonly clientId = 'test1';
  private readonly clientSecret = 'test2';

  private readonly scope = 'launch';
  private readonly redirectUri_iOS = 'capacitor://abc.com/launch-openaccount';
  private readonly redirectUri_Android = 'https://abc.com/launch-openaccount';
  private readonly jwtSessionEndpoint ='/aac/sps/api/authsessioncreation';
  private readonly authorizeEndpoint = '/mga/sps/oauth/oauth20/authorize';
  private readonly tokenEndpoint = '/mga/sps/oauth/oauth20/token';

  constructor(
    private cpxHttpClientService: CpxHttpClientService,
    private codeChallengeService: CodeChallengeService,
    private jwtService: JwtService,
    private sessionTokenStorageService: SessionTokenStorageService,
    private rsaKeyService: RSAKeyService,
    private environmentService: EnvironmentService,
    private platformInfoService: PlatformInfoService
  ) {}

  /**
 * Execute the full flow: JwtSessionCreation -> AuthCodeCreation -> AccessTokenRefreshTokenUsingAuthCode.
 */
performAuthTokenProcess(deviceId: string, uuid: string): Observable<any> {
  const state = uuidv4(); // Generate state dynamically

  return of(null).pipe(
    // Step 1: Generate and use JWT for JwtSessionCreation
    switchMap(() => this.jwtSessionCreation(deviceId, uuid)),

    // Step 2: Create code verifier and code challenge
    switchMap(() => {
      const codeVerifier = this.codeChallengeService.generateCodeVerifier();
      return this.codeChallengeService.generateCodeChallenge(codeVerifier).pipe(
        map((codeChallenge) => ({ codeVerifier, codeChallenge }))
      );
    }),

    // Step 3: Use codeVerifier and codeChallenge to create an authorization code
    switchMap(({ codeVerifier, codeChallenge }) =>
      this.authCodeCreation(
        this.getRedirectUri(),
        this.scope,
        state,
        codeChallenge
      ).pipe(map((authCode) => ({ authCode, codeVerifier })))
    ),

    // Step 4: Exchange auth code and code verifier for session tokens
    switchMap(({ authCode, codeVerifier }) =>
      this.accessSessionTokenRefreshTokenUsingAuthCode(
        authCode,
        codeVerifier
      ).pipe(map((tokenResponseObj) => tokenResponseObj))
    ),
    catchError((error) => {
      console.error('Error in performAuthTokenProcess:', error);
      return throwError(() => new Error('PerformAuthTokenProcess execution failed'));
    })
  );
}

// API call 1: JwtSessionCreation
private jwtSessionCreation(deviceId: string, uuid: string): Observable<void> {
  const publicKey = this.rsaKeyService.getPublicKey();
  const privateKey = this.rsaKeyService.getPrivateKey();

  return from(
    this.jwtService.generateToken(deviceId, publicKey, this.clientId, privateKey, uuid)
  ).pipe(
    switchMap((jwtToken) => {
      const payload = { JWT: jwtToken, uuid: uuid };
      console.log('Launch-log=>jwt service payload: ' + JSON.stringify(payload));
      return this.cpxHttpClientService.post(
        this.getWasamHost() + this.jwtSessionEndpoint,
        payload
      );
    }),
    map((response) => {
      if (response.status !== 204) {
        throw new Error('JwtSessionCreation failed');
      }
    }),
    catchError((error) => {
      console.error('Error in JwtSessionCreation:', error);
      throw error;
    })
  );
}

// API call 2: AuthCodeCreation
private authCodeCreation(
  redirectUri: string,
  scope: string,
  state: string,
  codeChallenge: string
): Observable<string> {
  const queryParams: HttpClientParams = {
    redirect_uri: decodeURIComponent(redirectUri),
    scope: scope,
    state: state,
    response_type: 'code',
    ui_locales: 'en-CA',
    client_id: this.clientId,
    response_mode: 'form_post',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  };

  return this.cpxHttpClientService
    .get<any>(this.getWasamHost() + this.authorizeEndpoint, {}, queryParams)
    .pipe(
      map((response) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.body, 'text/html');
        const authCodeInput = doc.querySelector('input[name="code"]') as HTMLInputElement;

        if (authCodeInput && authCodeInput.value) {
          return authCodeInput.value;
        } else {
          throw new Error('Auth code not found');
        }
      })
    );
}

// API call 3: AuthTokenRefreshTokenCreation
private accessSessionTokenRefreshTokenUsingAuthCode(
  authCode: string,
  codeVerifier: string
): Observable<any> {
  const reqBody = {
    grant_type: 'authorization_code',
    client_id: this.clientId,
    client_secret: this.clientSecret,
    redirect_uri: decodeURIComponent(this.getRedirectUri()),
    code: authCode,
    code_verifier: codeVerifier,
  };

  return this.cpxHttpClientService
    .post(
      this.getWasamHost() + this.tokenEndpoint,
      reqBody,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    .pipe(
      map((response: any) => {
        if (response && response.body && response.body.access_token) {
          this.sessionTokenStorageService.saveSessionTokenDetails(
            response.body.access_token,
            response.body.refresh_token,
            response.body.scope,
            response.body.expires_in
          );
          return response.body;
        } else {
          throw new Error('Failed to retrieve session tokens');
        }
      })
    );
}

// Utility methods
getRedirectUri() {
  return this.platformInfoService.isAndroid
    ? this.redirectUri_Android
    : this.redirectUri_iOS;
}

getWasamHost() {
  return this.platformInfoService.isNative
    ? this.environmentService.getWasamHost()
    : '';
}


}


--------------------------

import { TestBed } from '@angular/core/testing';
import { WasamNewSessionCreationService } from './wasam-new-session-creation.service';
import { of, throwError } from 'rxjs';
import { CpxHttpClientService } from './cpx-http-client.service';
import { CodeChallengeService } from './code-challenge.service';
import { JwtService } from './jwt.service';
import { SessionTokenStorageService } from './session-token-storage.service';
import { RSAKeyService } from './rsa-key.service';
import { PlatformInfoService } from '@abc/reddy/platforminfo';
import { EnvironmentService } from '../infra/environment.service';

describe('WasamNewSessionCreationService', () => {
  let service: WasamNewSessionCreationService;

  let cpxHttpClientServiceMock: any;
  let codeChallengeServiceMock: any;
  let jwtServiceMock: any;
  let sessionTokenStorageServiceMock: any;
  let rsaKeyServiceMock: any;
  let platformInfoServiceMock: any;
  let environmentServiceMock: any;

  beforeEach(() => {
    cpxHttpClientServiceMock = {
      post: jest.fn(),
      get: jest.fn(),
    };
    codeChallengeServiceMock = {
      generateCodeVerifier: jest.fn().mockReturnValue('mockCodeVerifier'),
      generateCodeChallenge: jest.fn().mockReturnValue(of('mockCodeChallenge')),
    };
    jwtServiceMock = {
      generateToken: jest.fn().mockReturnValue(of('mockJwtToken')),
    };
    sessionTokenStorageServiceMock = {
      saveSessionTokenDetails: jest.fn(),
    };
    rsaKeyServiceMock = {
      getPublicKey: jest.fn().mockReturnValue('mockPublicKey'),
      getPrivateKey: jest.fn().mockReturnValue('mockPrivateKey'),
    };
    platformInfoServiceMock = {
      isAndroid: true,
      isNative: true,
    };
    environmentServiceMock = {
      getWasamHost: jest.fn().mockReturnValue('https://mock.wasam.host'),
    };

    TestBed.configureTestingModule({
      providers: [
        WasamNewSessionCreationService,
        { provide: CpxHttpClientService, useValue: cpxHttpClientServiceMock },
        { provide: CodeChallengeService, useValue: codeChallengeServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: SessionTokenStorageService, useValue: sessionTokenStorageServiceMock },
        { provide: RSAKeyService, useValue: rsaKeyServiceMock },
        { provide: PlatformInfoService, useValue: platformInfoServiceMock },
        { provide: EnvironmentService, useValue: environmentServiceMock },
      ],
    });

    service = TestBed.inject(WasamNewSessionCreationService);
  });

  describe('performAuthTokenProcess', () => {
    it('should execute the full flow and return session tokens', (done) => {
      const deviceId = 'mockDeviceId';
      const uuid = 'mockUuid';

      cpxHttpClientServiceMock.post.mockReturnValueOnce(of({ status: 204 })); // JWT session creation
      cpxHttpClientServiceMock.get.mockReturnValueOnce(of({ body: '<input name="code" value="mockAuthCode">' })); // Auth code creation
      cpxHttpClientServiceMock.post.mockReturnValueOnce(of({ body: { access_token: 'mockAccessToken' } })); // Access token creation

      service.performAuthTokenProcess(deviceId, uuid).subscribe((result) => {
        expect(result).toEqual({ access_token: 'mockAccessToken' });
        done();
      });
    });

    it('should handle errors in the flow', (done) => {
      const deviceId = 'mockDeviceId';
      const uuid = 'mockUuid';

      cpxHttpClientServiceMock.post.mockReturnValueOnce(throwError(() => new Error('JWT session creation failed')));

      service.performAuthTokenProcess(deviceId, uuid).subscribe({
        error: (error) => {
          expect(error.message).toBe('PerformAuthTokenProcess execution failed');
          done();
        },
      });
    });

    it('should use the correct code challenge during performAuthTokenProcess', (done) => {
      const deviceId = 'mockDeviceId';
      const uuid = 'mockUuid';

      codeChallengeServiceMock.generateCodeChallenge.mockReturnValue(of('testCodeChallenge'));

      cpxHttpClientServiceMock.post.mockReturnValueOnce(of({ status: 204 })); // JWT session creation
      cpxHttpClientServiceMock.get.mockReturnValueOnce(of({ body: '<input name="code" value="mockAuthCode">' })); // Auth code creation
      cpxHttpClientServiceMock.post.mockReturnValueOnce(of({ body: { access_token: 'mockAccessToken' } })); // Access token creation

      service.performAuthTokenProcess(deviceId, uuid).subscribe((result) => {
        expect(result).toEqual({ access_token: 'mockAccessToken' });
        expect(codeChallengeServiceMock.generateCodeChallenge).toHaveBeenCalledWith('mockCodeVerifier');
        done();
      });
    });
  });

  describe('jwtSessionCreation', () => {
    it('should call JwtService and post the payload', (done) => {
      const deviceId = 'mockDeviceId';
      const uuid = 'mockUuid';

      cpxHttpClientServiceMock.post.mockReturnValueOnce(of({ status: 204 }));

      service['jwtSessionCreation'](deviceId, uuid).subscribe(() => {
        expect(jwtServiceMock.generateToken).toHaveBeenCalledWith(
          deviceId,
          'mockPublicKey',
          'test1',
          'mockPrivateKey',
          uuid
        );
        expect(cpxHttpClientServiceMock.post).toHaveBeenCalledWith(
          'https://mock.wasam.host/aac/sps/api/authsessioncreation',
          { JWT: 'mockJwtToken', uuid: uuid }
        );
        done();
      });
    });

    it('should handle errors in jwtSessionCreation gracefully', (done) => {
      const deviceId = 'mockDeviceId';
      const uuid = 'mockUuid';

      cpxHttpClientServiceMock.post.mockReturnValueOnce(throwError(() => new Error('JWT session creation failed')));

      service['jwtSessionCreation'](deviceId, uuid).subscribe({
        error: (error) => {
          expect(error.message).toBe('JWT session creation failed');
          done();
        },
      });
    });
  });

  describe('authCodeCreation', () => {
    it('should parse and return the auth code from the response', (done) => {
      cpxHttpClientServiceMock.get.mockReturnValueOnce(of({ body: '<input name="code" value="mockAuthCode">' }));

      service['authCodeCreation']('mockRedirectUri', 'mockScope', 'mockState', 'mockCodeChallenge').subscribe((authCode) => {
        expect(authCode).toBe('mockAuthCode');
        done();
      });
    });

    it('should throw an error if auth code is not found in authCodeCreation', (done) => {
      cpxHttpClientServiceMock.get.mockReturnValueOnce(of({ body: '<input name="wrongInput" value="">' }));

      service['authCodeCreation']('mockRedirectUri', 'mockScope', 'mockState', 'mockCodeChallenge').subscribe({
        error: (error) => {
          expect(error.message).toBe('Auth code not found');
          done();
        },
      });
    });
  });

  describe('accessSessionTokenRefreshTokenUsingAuthCode', () => {
    it('should save session tokens and return the response body', (done) => {
      const responseBody = {
        access_token: 'mockAccessToken',
        refresh_token: 'mockRefreshToken',
        scope: 'mockScope',
        expires_in: 3600,
      };
      cpxHttpClientServiceMock.post.mockReturnValueOnce(of({ body: responseBody }));

      service['accessSessionTokenRefreshTokenUsingAuthCode']('mockAuthCode', 'mockCodeVerifier').subscribe((result) => {
        expect(sessionTokenStorageServiceMock.saveSessionTokenDetails).toHaveBeenCalledWith(
          'mockAccessToken',
          'mockRefreshToken',
          'mockScope',
          3600
        );
        expect(result).toEqual(responseBody);
        done();
      });
    });

    it('should throw an error if access tokens are not retrieved', (done) => {
      cpxHttpClientServiceMock.post.mockReturnValueOnce(of({ body: {} })); // Empty response body

      service['accessSessionTokenRefreshTokenUsingAuthCode']('mockAuthCode', 'mockCodeVerifier').subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to retrieve session tokens');
          done();
        },
      });
    });
  });

  describe('utility methods', () => {
    it('getRedirectUri should return correct URI based on platform', () => {
      platformInfoServiceMock.isAndroid = true;
      expect(service.getRedirectUri()).toBe('https://abc.com/launch-openaccount');

      platformInfoServiceMock.isAndroid = false;
      expect(service.getRedirectUri()).toBe('capacitor://abc.com/launch-openaccount');
    });

    it('getWasamHost should return correct host based on platform', () => {
      platformInfoServiceMock.isNative = true;
      expect(service.getWasamHost()).toBe('https://mock.wasam.host');

      platformInfoServiceMock.isNative = false;
      expect(service.getWasamHost()).toBe('')
