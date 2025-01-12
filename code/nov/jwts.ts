import { Injectable } from '@angular/core';
import * as jwt from 'jsonwebtoken';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor() {}

  generateToken(deviceId: string, publicKey: string, clientId: string, secretKey: string): string {
    const payload = {
      deviceId: deviceId,
      publicKey: publicKey,
      clientID: clientId
    };

    const signOptions = {
      expiresIn: '120',
      header: {
        alg: 'RS256',
        typ: 'JWT',
        kid: deviceId
      }
    };

    try {
      const token = jwt.sign(payload, secretKey, signOptions);
      return token;
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new Error('Failed to generate token');
    }
  }
}


---------------

import { Injectable } from '@angular/core';
import { SignJWT } from 'jose';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor() {}

  async generateToken(
    deviceId: string,
    publicKey: string,
    privateKey: string,
    clientId: string
  ): Promise<string> {
    // Remove newlines from the public key
    const sanitizedPublicKey = publicKey.replace(/\n/g, '');

    const payload = {
      deviceId,
      publicKey: sanitizedPublicKey,
      clientID: clientId,
      iat: Math.floor(Date.now() / 1000), // Issued at (current timestamp in seconds)
    };

    try {
      // Convert the private key to a CryptoKey object
      const cryptoPrivateKey = await this.importPrivateKey(privateKey);

      // Generate the token using RS256
      const token = await new SignJWT(payload)
        .setProtectedHeader({
          alg: 'RS256', // Use RSA SHA-256 for signing
          typ: 'JWT',
        })
        .setExpirationTime('120s')
        .sign(cryptoPrivateKey);

      return token;
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Import a PEM-encoded private key to a CryptoKey object
   * @param pemKey Private key in PEM format
   * @returns A CryptoKey object
   */
  private async importPrivateKey(pemKey: string): Promise<CryptoKey> {
    // Remove the PEM header, footer, and newlines, and convert to ArrayBuffer
    const key = pemKey
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\n/g, '');
    const binaryKey = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));

    // Import the key using Web Crypto API
    return await crypto.subtle.importKey(
      'pkcs8', // Key format
      binaryKey.buffer, // Key data
      {
        name: 'RSASSA-PKCS1-v1_5', // Algorithm
        hash: { name: 'SHA-256' }, // Hash algorithm
      },
      false, // Extractable
      ['sign'] // Key usage
    );
  }
}

---------------------

import { JwtService } from './jwt.service';

jest.mock('jose', () => {
  return {
    SignJWT: jest.fn().mockImplementation(() => ({
      setProtectedHeader: jest.fn().mockReturnThis(),
      setExpirationTime: jest.fn().mockReturnThis(),
      sign: jest.fn().mockResolvedValue('mocked_jwt_token'),
    })),
  };
});

const mockImportKey = jest.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      importKey: mockImportKey,
    },
  },
});

mockImportKey.mockResolvedValue('mocked_crypto_key');

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(() => {
    service = new JwtService();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a JWT token successfully', async () => {
    const deviceId = 'device123';
    const publicKey = btoa('mockPublicKey'); // Mock valid Base64 public key
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${btoa('mockPrivateKey')}\n-----END PRIVATE KEY-----`;
    const clientId = 'client123';
    const kid = 'key123';

    const token = await service.generateToken(deviceId, publicKey, privateKey, clientId, kid);

    expect(token).toBe('mocked_jwt_token');
    expect(mockImportKey).toHaveBeenCalledWith(
      'pkcs8',
      expect.any(ArrayBuffer),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' },
      },
      false,
      ['sign']
    );
    expect((await import('jose')).SignJWT).toHaveBeenCalledWith({
      deviceId: 'device123',
      publicKey: 'mockPublicKey',
      clientID: 'client123',
      iat: expect.any(Number),
    });
  });

  it('should handle errors during token generation', async () => {
    mockImportKey.mockRejectedValueOnce(new Error('Import key failed'));

    const deviceId = 'device123';
    const publicKey = btoa('mockPublicKey');
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${btoa('mockPrivateKey')}\n-----END PRIVATE KEY-----`;
    const clientId = 'client123';
    const kid = 'key123';

    await expect(
      service.generateToken(deviceId, publicKey, privateKey, clientId, kid)
    ).rejects.toThrow('Failed to generate token');

    expect(mockImportKey).toHaveBeenCalled();
  });

  it('should sanitize the public key', async () => {
    const deviceId = 'device123';
    const publicKey = 'mock\nPublic\nKey\n';
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${btoa('mockPrivateKey')}\n-----END PRIVATE KEY-----`;
    const clientId = 'client123';
    const kid = 'key123';

    await service.generateToken(deviceId, publicKey, privateKey, clientId, kid);

    expect((await import('jose')).SignJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        publicKey: 'mockPublicKey', // Sanitized public key
      })
    );
  });

  it('should handle invalid Base64 strings gracefully', async () => {
    const deviceId = 'device123';
    const publicKey = 'invalid_base64'; // Invalid Base64 string
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${btoa('mockPrivateKey')}\n-----END PRIVATE KEY-----`;
    const clientId = 'client123';
    const kid = 'key123';

    await expect(
      service.generateToken(deviceId, publicKey, privateKey, clientId, kid)
    ).rejects.toThrow('Failed to generate token');
  });
});
