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
    clientId: string,
    secretKey: string
  ): Promise<string> {
    const payload = {
      deviceId,
      publicKey,
      clientID: clientId,
    };

    try {
      const token = await new SignJWT(payload)
        .setProtectedHeader({
          alg: 'HS256', // Use HMAC SHA-256 for signing
          typ: 'JWT',
        })
        .setExpirationTime('2h')
        .sign(new TextEncoder().encode(secretKey)); // Encode secretKey as Uint8Array
      return token;
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new Error('Failed to generate token');
    }
  }
}
