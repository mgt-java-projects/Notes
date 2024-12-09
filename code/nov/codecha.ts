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

-----------

export class Myservice {
    codeVerifier: string;
    readonly codeVerifierLength = 60;
  
    // Encode a string to Base64 URL-safe format
    private b64EncodeUrl(input: string): string {
      const base64 = btoa(input);
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
  
    // Generate a random code_verifier
    public generateCodeVerifier(): string {
      if (!this.codeVerifier) {
        // Generate random values
        const randomValues = new Uint8Array(this.codeVerifierLength);
        window.crypto.getRandomValues(randomValues);
  
        // Map the random bytes to characters and create the verifier
        this.codeVerifier = Array.from(randomValues, byte => String.fromCharCode(byte))
          .join('')
          .substring(0, this.codeVerifierLength);
  
        // Base64 URL-safe encode the code_verifier
        this.codeVerifier = this.b64EncodeUrl(this.codeVerifier);
      }
  
      return this.codeVerifier;
    }
  
    // Synchronous method to generate the code_challenge
    public codeChallenge(): string {
      if (!this.codeVerifier) {
        throw new Error('Code verifier has not been generated.');
      }
  
      // Convert the code verifier to ASCII bytes
      const asciiBytes = this.stringToAsciiBytes(this.codeVerifier);
  
      // Perform SHA-256 hashing and wait for its completion internally
      const hashBuffer = this.performDigestSync(asciiBytes);
  
      // Convert the resulting hash to Base64 URL-safe format
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return this.b64EncodeUrl(String.fromCharCode.apply(null, hashArray));
    }
  
    // Convert a string to a Uint8Array of ASCII bytes
    private stringToAsciiBytes(input: string): Uint8Array {
      const bytes = new Uint8Array(input.length);
      for (let i = 0; i < input.length; i++) {
        bytes[i] = input.charCodeAt(i);
      }
      return bytes;
    }
  
    // Internally handle async digest as sync
    private performDigestSync(input: Uint8Array): ArrayBuffer {
      let hashBuffer: ArrayBuffer;
  
      // Use a blocking approach to wait for the async operation to complete
      const promise = window.crypto.subtle.digest('SHA-256', input);
      promise.then(buffer => (hashBuffer = buffer));
  
      while (!hashBuffer) {
        // Block execution until the async promise resolves
        // This effectively synchronizes the async operation
      }
  
      return hashBuffer!;
    }
  }
  
