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
    const payload = {
      deviceId,
      publicKey,
      clientID: clientId,
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
        .setExpirationTime('2h')
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
    // Remove the PEM header and footer, and convert to ArrayBuffer
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

