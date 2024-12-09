import { Injectable } from '@angular/core';
import { CpxHttpClientService } from './cpx-http-client.service';
import { CodeChallengeService } from './code-challenge.service';
import { JwtService } from './jwt.service';
import { SessionTokenStorageService } from './session-token-storage.service';
import { Observable, throwError, of } from 'rxjs';
import { switchMap, map, catchError, from } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class FreshSessionTokenService {
  private readonly clientId = 'your-client-id';
  private readonly clientSecret = 'your-client-secret';
  private readonly redirectUri = 'capacitor://www.com/launch';
  private readonly scope = 'launch';

  private readonly adSessionEndpoint = '/sessionCreation';
  private readonly authorizeEndpoint = '/authorize';
  private readonly tokenEndpoint = '/sps/oauth/oauth20/token';

  constructor(
    private cpxHttpClientService: CpxHttpClientService,
    private codeChallengeService: CodeChallengeService,
    private jwtService: JwtService,
    private sessionTokenStorageService: SessionTokenStorageService
  ) {}

  /**
   * Execute the full flow: ADSessionCreation -> AuthCodeCreation -> AccessTokenRefreshTokenUsingAuthCode.
   */
  performAuthTokenProcess(): Observable<any> {
    const state = uuidv4(); // Generate state dynamically

    return of(null).pipe(
      // Step 1: Generate and use JWT for ADSessionCreation
      switchMap(() => this.adSessionCreation()),

      // Step 2: Create code verifier and code challenge
      switchMap(() => {
        const codeVerifier = this.codeChallengeService.generateCodeVerifier();
        return from(this.codeChallengeService.generateCodeChallenger(codeVerifier)).pipe(
          map(codeChallenge => ({ codeVerifier, codeChallenge }))
        );
      }),

      // Step 3: Use codeVerifier and codeChallenge to create an authorization code
      switchMap(({ codeVerifier, codeChallenge }) =>
        this.authCodeCreation(this.redirectUri, this.scope, state, codeChallenge).pipe(
          map(authCode => ({ authCode, codeVerifier }))
        )
      ),

      // Step 4: Exchange auth code and code verifier for session tokens
      switchMap(({ authCode, codeVerifier }) =>
        this.accessSessionTokenRefreshTokenUsingAuthCode(authCode, codeVerifier)
      ),

      catchError(error => {
        console.error('Error in executeFullFlow:', error);
        return throwError(() => new Error('Flow execution failed'));
      })
    );
  }

  private adSessionCreation(): Observable<void> {
    // Logic for ADSessionCreation using JWT
    const jwtToken = this.jwtService.generateToken('deviceId', 'publicKey', this.clientId, 'privateKey');
    const payload = { JWT: jwtToken, UUID: 'uuid' };

    return this.cpxHttpClientService.post(this.adSessionEndpoint, payload, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      map(response => {
        if (response.status !== 204) {
          throw new Error('ADSessionCreation failed');
        }
      })
    );
  }

  private authCodeCreation(
    redirectUri: string,
    scope: string,
    state: string,
    codeChallenge: string
  ): Observable<string> {
    const queryParams = {
      redirect_uri: redirectUri,
      scope: scope,
      state: state,
      response_type: 'code',
      ui_locales: 'en-CA',
      client_id: this.clientId,
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
          throw new Error('Auth code not found');
        }
      })
    );
  }

  private accessSessionTokenRefreshTokenUsingAuthCode(authCode: string, codeVerifier: string): Observable<any> {
    const body = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code: authCode,
      code_verifier: codeVerifier
    };

    return this.cpxHttpClientService.post(this.tokenEndpoint, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      map(response => {
        if (response && response.access_token) {
          this.sessionTokenStorageService.saveSessionTokenDetails(
            response.access_token,
            response.refresh_token,
            response.scope,
            response.expires_in
          );
          return response;
        } else {
          throw new Error('Failed to retrieve session tokens');
        }
      })
    );
  }
}
