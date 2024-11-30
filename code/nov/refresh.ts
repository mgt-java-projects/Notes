import { Injectable } from '@angular/core';
import { SessionTokenStorageService } from './session-token-storage.service';
import { CpxHttpClientService } from './cpx-http-client.service';
import { CodeChallengeService } from './code-challenge.service';
import { Observable, Subscription, interval, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RefreshSessionTokenService {
  private readonly tokenEndpoint = '/sps/oauth/oauth20/token';
  private readonly clientId = 'your-client-id';
  private readonly clientSecret = 'your-client-secret';
  private readonly redirectUri = 'capacitor://www.com/launch';

  private refreshTokenTimerSubscription: Subscription | null = null;

  constructor(
    private sessionTokenStorageService: SessionTokenStorageService,
    private cpxHttpClientService: CpxHttpClientService,
    private codeChallengeService: CodeChallengeService
  ) {}

  /**
   * Start refresh token logic.
   */
  startRefreshTokenLogic(): void {
    this.stopRefreshTokenLogic(); // Ensure no duplicate timers

    const sessionTokenDetails = this.sessionTokenStorageService.getSessionTokenDetails();
    if (!sessionTokenDetails || !sessionTokenDetails.refreshToken) {
      throw new Error('No valid session token available for refreshing');
    }

    const codeVerifier = this.codeChallengeService.getCodeVerifier(); // Fetch code verifier

    this.refreshTokenTimerSubscription = interval(11 * 60 * 1000) // Every 11 minutes
      .pipe(
        switchMap(() =>
          this.refreshSessionTokenCall(sessionTokenDetails.refreshToken, codeVerifier)
        ),
        catchError(error => {
          console.error('Error refreshing session tokens:', error);
          return throwError(() => new Error('Refresh session token failed'));
        })
      )
      .subscribe(newSessionTokenDetails => {
        this.sessionTokenStorageService.saveSessionTokenDetails(
          newSessionTokenDetails.accessToken,
          newSessionTokenDetails.refreshToken,
          newSessionTokenDetails.scope,
          newSessionTokenDetails.expiresIn
        );
        console.log('Session tokens refreshed successfully');
      });
  }

  /**
   * Stop the refresh token logic.
   */
  stopRefreshTokenLogic(): void {
    if (this.refreshTokenTimerSubscription) {
      this.refreshTokenTimerSubscription.unsubscribe();
      this.refreshTokenTimerSubscription = null;
    }
  }

  /**
   * Make the refresh token API call.
   */
  private refreshSessionTokenCall(refreshToken: string, codeVerifier: string): Observable<any> {
    const body = {
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code: refreshToken,
      code_verifier: codeVerifier
    };

    return this.cpxHttpClientService.post(this.tokenEndpoint, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      map(response => {
        if (response && response.access_token) {
          return response;
        } else {
          throw new Error('Failed to refresh session tokens');
        }
      })
    );
  }
}
