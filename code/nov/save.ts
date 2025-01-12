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
   * Get access token.
   * @returns The access token or null if not available.
   */
  getAccessToken(): string | null {
    return this.tokenDetails?.accessToken || null;
  }

  /**
   * Get refresh token.
   * @returns The refresh token or null if not available.
   */
  getRefreshToken(): string | null {
    return this.tokenDetails?.refreshToken || null;
  }

  /**
   * Get created time.
   * @returns The created time or null if not available.
   */
  getCreatedTime(): Date | null {
    return this.tokenDetails?.createdTime || null;
  }

  /**
   * Check if the access token is valid by comparing created time and expiration time.
   * @returns True if the access token is valid, otherwise false.
   */
  hasAccessTokenValid(): boolean {
    if (!this.tokenDetails) {
      return false;
    }

    const { createdTime, expiresIn } = this.tokenDetails;
    if (!createdTime || !expiresIn) {
      return false;
    }

    const currentTime = new Date().getTime();
    const expiryTime = new Date(createdTime).getTime() + expiresIn * 1000;

    return currentTime < expiryTime;
  }

  /**
   * Clear session token details.
   */
  clearSessionTokenDetails(): void {
    this.tokenDetails = null;
  }
}


----------

import { SessionTokenStorageService } from './session-token-storage.service';
import { TokenDetails } from './token-details.model';

describe('SessionTokenStorageService', () => {
  let service: SessionTokenStorageService;

  beforeEach(() => {
    service = new SessionTokenStorageService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveSessionTokenDetails', () => {
    it('should save session token details', () => {
      const accessToken = 'testAccessToken';
      const refreshToken = 'testRefreshToken';
      const scope = 'testScope';
      const expiresIn = 3600;

      service.saveSessionTokenDetails(accessToken, refreshToken, scope, expiresIn);
      const tokenDetails = service.getSessionTokenDetails();

      expect(tokenDetails).toEqual(
        expect.objectContaining({
          accessToken,
          refreshToken,
          scope,
          expiresIn,
          createdTime: expect.any(Date),
        })
      );
    });
  });

  describe('getSessionTokenDetails', () => {
    it('should return null if no token details are saved', () => {
      expect(service.getSessionTokenDetails()).toBeNull();
    });

    it('should return the saved token details', () => {
      const tokenDetails: TokenDetails = {
        accessToken: 'testAccessToken',
        refreshToken: 'testRefreshToken',
        scope: 'testScope',
        expiresIn: 3600,
        createdTime: new Date(),
      };

      service.saveSessionTokenDetails(
        tokenDetails.accessToken,
        tokenDetails.refreshToken,
        tokenDetails.scope,
        tokenDetails.expiresIn
      );

      expect(service.getSessionTokenDetails()).toEqual(tokenDetails);
    });
  });

  describe('getAccessToken', () => {
    it('should return the access token if available', () => {
      const accessToken = 'testAccessToken';
      service.saveSessionTokenDetails(accessToken, 'testRefreshToken', 'testScope', 3600);
      expect(service.getAccessToken()).toBe(accessToken);
    });

    it('should return null if no access token is available', () => {
      expect(service.getAccessToken()).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return the refresh token if available', () => {
      const refreshToken = 'testRefreshToken';
      service.saveSessionTokenDetails('testAccessToken', refreshToken, 'testScope', 3600);
      expect(service.getRefreshToken()).toBe(refreshToken);
    });

    it('should return null if no refresh token is available', () => {
      expect(service.getRefreshToken()).toBeNull();
    });
  });

  describe('getCreatedTime', () => {
    it('should return the created time if available', () => {
      const createdTime = new Date();
      service.saveSessionTokenDetails('testAccessToken', 'testRefreshToken', 'testScope', 3600);
      const tokenDetails = service.getSessionTokenDetails();
      expect(tokenDetails?.createdTime).toEqual(createdTime);
    });

    it('should return null if no created time is available', () => {
      expect(service.getCreatedTime()).toBeNull();
    });
  });

  describe('hasAccessTokenValid', () => {
    it('should return true if the access token is valid', () => {
      const expiresIn = 3600; // 1 hour
      service.saveSessionTokenDetails('testAccessToken', 'testRefreshToken', 'testScope', expiresIn);

      expect(service.hasAccessTokenValid()).toBe(true);
    });

    it('should return false if the access token is expired', () => {
      const createdTime = new Date(Date.now() - 7200 * 1000); // 2 hours ago
      const tokenDetails: TokenDetails = {
        accessToken: 'testAccessToken',
        refreshToken: 'testRefreshToken',
        scope: 'testScope',
        expiresIn: 3600, // 1 hour
        createdTime,
      };

      service['tokenDetails'] = tokenDetails;

      expect(service.hasAccessTokenValid()).toBe(false);
    });

    it('should return false if token details are not available', () => {
      expect(service.hasAccessTokenValid()).toBe(false);
    });
  });

  describe('clearSessionTokenDetails', () => {
    it('should clear the token details', () => {
      service.saveSessionTokenDetails('testAccessToken', 'testRefreshToken', 'testScope', 3600);
      service.clearSessionTokenDetails();
      expect(service.getSessionTokenDetails()).toBeNull();
    });
  });
});


--------
export interface TokenDetails {
    accessToken: string;     // The access token for the session
    refreshToken: string;    // The refresh token for renewing the session
    scope: string;           // The scope of the access token
    expiresIn: number;       // The expiry time (in seconds) for the access token
    createdTime: Date;       // The time when the token was created
  }
  
