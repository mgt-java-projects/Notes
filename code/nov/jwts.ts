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
