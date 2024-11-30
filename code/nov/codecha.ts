import { Injectable } from '@angular/core';
import * as crypto from 'crypto-browserify';

@Injectable({
  providedIn: 'root'
})
export class CodeChallengeService {
  constructor() {}

  // Generate a random code_verifier
  generateCodeVerifier(): string {
    return crypto.randomBytes(60).toString('hex').slice(0, 128);
  }

  // Generate the code_challenge from the code_verifier
  generateCodeChallenge(codeVerifier: string): string {
    return crypto
      .createHash('sha256')
      .update(Buffer.from(codeVerifier))
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}
