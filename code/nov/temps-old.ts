import { Injectable } from '@angular/core';
import { CpxHttpClientService } from './cpx-http-client.service';
import { CodeChallengeService } from './code-challenge.service';
import { JwtService } from './jwt.service';
import { LaStorageService } from './la-storage.service';
import { TokenDetails } from './token-details.model'; // Import the TokenDetails model
import { Observable, throwError, interval, Subscription, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TempSessionCreationService {
  // Hardcoded values
  private readonly clientId = 'your-client-id';
  private readonly clientSecret = 'your-client-secret';
  private readonly redirectUri = 'capacitor://mb.b.com/launch';
  private readonly scope = 'launch'; // Hardcoded scope

  private readonly adSessionEndpoint = '/sessionCreation';
  private readonly authorizeEndpoint = '/authorize';
  private readonly tokenEndpoint = '/sps/oauth/oauth20/token';

  private refreshTokenTimerSubscription: Subscription | null = null;

  // Store token details
  private tokenDetails: TokenDetails | null = null;

  constructor(
    private cpxHttpClientService: CpxHttpClientService,
    private codeChallengeService: CodeChallengeService,
    private jwtService: JwtService,
    private laStorageService: LaStorageService
  ) {}

  /**
   * Execute the full flow: ADSessionCreation -> AuthCodeCreation -> AccessTokenRefreshTokenUsingAuthCode.
   */
  executeFullFlow(): Observable<any> {
    let rsaPrivateKey: string;
    let rsaPublicKey: string;
    let uuid: string;
    let deviceId: string;
    let codeVerifier: string;

    // Generate state dynamically
    const state = uuidv4();

    return of(null).pipe(
      // Operation 1: ADSessionCreation
      switchMap(() => {
        rsaPrivateKey = this.laStorageService.getStringValue('rsa_private_key');
        rsaPublicKey = this.laStorageService.getStringValue('rsa_public_key');
        uuid = this.laStorageService.getStringValue('uuid');
        deviceId = this.laStorageService.getStringValue('deviceid');

        if (!rsaPrivateKey || !rsaPublicKey || !uuid || !deviceId) {
          throw new Error('Required values not found in LaStorageService');
        }

        const jwtToken = this.jwtService.generateToken(deviceId, rsaPublicKey, this.clientId, rsaPrivateKey);
        return this.ADSessionCreation(jwtToken, uuid);
      }),

      // Operation 2: AuthCodeCreation
      switchMap(() => {
        codeVerifier = this.codeChallengeService.generateCodeVerifier();
        const codeChallenge = this.codeChallengeService.generateCodeChallenge(codeVerifier);
        return this.AuthCodeCreation(this.redirectUri, this.scope, state, this.clientId, codeChallenge);
      }),

      // Operation 3: AccessTokenRefreshTokenUsingAuthCode
      switchMap(authCode => {
        return this.AccessTokenRefreshTokenUsingAuthCode(this.clientId, this.clientSecret, this.redirectUri, authCode, codeVerifier);
      }),

      catchError(error => {
        console.error('Error in executeFullFlow:', error);
        return throwError(() => new Error('Flow execution failed'));
      })
    );
  }

  /**
   * Operation 1: ADSessionCreation
   */
  private ADSessionCreation(jwtToken: string, uuid: string): Observable<void> {
    const payload = { JWT: jwtToken, UUID: uuid };

    return this.cpxHttpClientService.post(this.adSessionEndpoint, payload, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      map(response => {
        if (response.status === 204) {
          const adSessionId = this.extractCookie('AD_SESSIONID');
          if (!adSessionId) {
            throw new Error('Unauthorized: AD_SESSIONID cookie is missing');
          }
        } else {
          throw new Error('Unexpected response from session creation');
        }
      })
    );
  }

  /**
   * Operation 2: AuthCodeCreation
   */
  private AuthCodeCreation(
    redirectUri: string,
    scope: string,
    state: string,
    clientId: string,
    codeChallenge: string
  ): Observable<string> {
    const queryParams = {
      redirect_uri: redirectUri,
      scope: scope,
      state: state,
      response_type: 'code',
      ui_locales: 'en-CA',
      client_id: clientId,
      response_mode: 'form_post',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    };

    return this.cpxHttpClientService.post<any>(this.authorizeEndpoint, null, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: queryParams
    }).pipe(
      map(response => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.body, 'text/html');
        const authCodeInput = doc.querySelector('input[name="code"]') as HTMLInputElement;

        if (authCodeInput && authCodeInput.value) {
          return authCodeInput.value;
        } else {
          throw new Error('Auth code not found in response');
        }
      })
    );
  }

  /**
   * Operation 3: AccessTokenRefreshTokenUsingAuthCode
   */
  private AccessTokenRefreshTokenUsingAuthCode(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    code: string,
    codeVerifier: string
  ): Observable<any> {
    const body = {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code,
      code_verifier: codeVerifier
    };

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    return this.cpxHttpClientService.post(this.tokenEndpoint, body, { headers }).pipe(
      map(response => {
        if (response && response.access_token) {
          // Save token details
          this.saveTokenDetails(
            response.access_token,
            response.refresh_token,
            response.scope,
            response.expires_in
          );
          return {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            scope: response.scope,
            tokenType: response.token_type,
            expiresIn: response.expires_in
          };
        } else {
          throw new Error('Failed to retrieve access token');
        }
      })
    );
  }

  /**
   * Operation 4: AccessTokenRefreshTokenUsingRefreshToken
   */
  AccessTokenRefreshTokenUsingRefreshToken(refreshToken: string): void {
    const refreshInterval = 11 * 60 * 1000; // 11 minutes in milliseconds

    // Start the refresh token timer
    this.refreshTokenTimerSubscription = interval(refreshInterval)
      .pipe(
        switchMap(() => {
          console.log('Refreshing tokens...');
          return this.refreshTokenCall(refreshToken);
        })
      )
      .subscribe(
        newTokens => {
          console.log('New tokens received:', newTokens);

          // Save the new token details
          this.saveTokenDetails(
            newTokens.accessToken,
            newTokens.refreshToken,
            newTokens.scope,
            newTokens.expiresIn
          );

          // Update the refreshToken to use the newly received refreshToken
          refreshToken = newTokens.refreshToken;
        },
        error => {
          console.error('Error refreshing tokens:', error.message);
        }
      );
  }

  private refreshTokenCall(refreshToken: string): Observable<any> {
    const body = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri
    };

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    return this.cpxHttpClientService.post(this.tokenEndpoint, body, { headers }).pipe(
      map(response => {
        if (response && response.access_token) {
          return {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            scope: response.scope,
            tokenType: response.token_type,
            expiresIn: response.expires_in
          };
        } else {
          throw new Error('Failed to retrieve new tokens');
        }
      }),
      catchError(error => {
        console.error('Error refreshing token:', error);
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  private saveTokenDetails(accessToken: string, refreshToken: string, scope: string, expiresIn: number): void {
    this.tokenDetails = {
      accessToken,
      refreshToken,
      scope,
      expiresIn,
      createdTime: new Date() // Set the current time as created time
    };
  }

  getTokenDetails(): TokenDetails | null {
    return this.tokenDetails;
  }

  stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimerSubscription) {
      this.refreshTokenTimerSubscription.unsubscribe();
      this.refreshTokenTimerSubscription = null;
      console.log('Refresh token timer stopped.');
    }
  }

  private extractCookie(cookieName: string): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key.trim() === cookieName) {
        return value.trim();
      }
    }
    return null;
  }
}
