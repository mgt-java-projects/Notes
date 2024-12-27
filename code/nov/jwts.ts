import { Injectable } from '@angular/core';
import { SignJWT, importPKCS8 } from 'jose';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor() {}

  // privateKeyPEM should be an RSA private key in PKCS#8 or PKCS#1 format 
  // (converted to PKCS#8 if necessary).
  // E.g., "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----"
  async generateToken(
    deviceId: string,
    publicKey: string,
    clientId: string,
    privateKeyPEM: string
  ): Promise<string> {
    // Prepare the payload
    const payload = {
      deviceId,
      publicKey,
      clientID: clientId,
    };

    // Convert the PEM-encoded private key string into a CryptoKey
    // 'RS256' indicates we're using RSA with SHA-256
    const privateKey = await importPKCS8(privateKeyPEM, 'RS256');

    try {
      // Create and sign the JWT
      const token = await new SignJWT(payload)
        .setProtectedHeader({
          alg: 'RS256', // RS256 for RSA signature
          typ: 'JWT',
        })
        .setExpirationTime('2h')
        .sign(privateKey);

      return token;
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new Error('Failed to generate token');
    }
  }
}
