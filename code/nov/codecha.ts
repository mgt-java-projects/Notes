

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
