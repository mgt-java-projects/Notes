

export class CodeChallengeService {
  codeVerifier: string;
  readonly codeVerifierLength = 60;

  b64EncodeUrl(string: string) {
    const res = btoa(string).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return res;
  }

  public generateCodeVerifier(): string {
    if (!this.codeVerifier) {
      this.codeVerifier = this.b64EncodeUrl(
        Array.prototype.map
          .call(crypto.getRandomValues(new Uint8Array(this.codeVerifierLength)), function (number) {
            return String.fromCharCode(number);
          })
          .join('')
      ).substring(0, this.codeVerifierLength);
    }
    return this.codeVerifier;
  }

  public async generateCodeChallenger(codeVerifier: string): Promise<string> {
    const asciiBytes = this.stringToAsciiBytes(codeVerifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', asciiBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert Uint8Array to number[]
    return this.b64EncodeUrl(String.fromCharCode(...hashArray)); // Use spread operator
  }

  private stringToAsciiBytes(input: string): Uint8Array {
    const bytes = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      bytes[i] = input.charCodeAt(i);
    }
    return bytes;
  }
}
----------------

import { CodeChallengeService } from './code-challenge.service';

describe('CodeChallengeService', () => {
  let service: CodeChallengeService;

  beforeEach(() => {
    service = new CodeChallengeService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('b64EncodeUrl', () => {
    it('should base64 encode a string and make it URL-safe', () => {
      const input = 'test string';
      const expectedOutput = btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const result = service.b64EncodeUrl(input);
      expect(result).toBe(expectedOutput);
    });
  });

  describe('generateCodeVerifier', () => {
    it('should generate a code verifier of specified length', () => {
      const verifier = service.generateCodeVerifier();
      expect(verifier).toBeDefined();
      expect(verifier.length).toBe(service.codeVerifierLength);
    });

    it('should return the same code verifier on subsequent calls', () => {
      const firstCall = service.generateCodeVerifier();
      const secondCall = service.generateCodeVerifier();
      expect(firstCall).toBe(secondCall);
    });
  });

  describe('generateCodeChallenger', () => {
    it('should generate a code challenge from a code verifier', async () => {
      const verifier = 'testverifier';
      const asciiBytes = new Uint8Array(verifier.split('').map((char) => char.charCodeAt(0)));

      const expectedHashBuffer = await crypto.subtle.digest('SHA-256', asciiBytes);
      const hashArray = Array.from(new Uint8Array(expectedHashBuffer));
      const expectedChallenge = btoa(String.fromCharCode(...hashArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const challenge = await service.generateCodeChallenger(verifier);
      expect(challenge).toBe(expectedChallenge);
    });
  });

  describe('stringToAsciiBytes', () => {
    it('should convert a string to its ASCII byte representation', () => {
      const input = 'abc';
      const expectedOutput = new Uint8Array([97, 98, 99]);

      const result = (service as any).stringToAsciiBytes(input); // Access private method
      expect(result).toEqual(expectedOutput);
    });
  });
});
