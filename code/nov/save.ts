import { Injectable } from '@angular/core';
import { TokenDetails } from './token-details.model';

@Injectable({
  providedIn: 'root'
})
export class SessionTokenStorageService {
  private tokenDetails: TokenDetails | null = null;

  /**
   * Save session token details.
   */
  saveSessionTokenDetails(accessToken: string, refreshToken: string, scope: string, expiresIn: number): void {
    this.tokenDetails = {
      accessToken,
      refreshToken,
      scope,
      expiresIn,
      createdTime: new Date() // Set the current time as created time
    };
  }

  /**
   * Get session token details.
   * @returns The session token details or null if not available.
   */
  getSessionTokenDetails(): TokenDetails | null {
    return this.tokenDetails;
  }

  /**
   * Clear session token details.
   */
  clearSessionTokenDetails(): void {
    this.tokenDetails = null;
  }
}
