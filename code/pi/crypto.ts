import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RSAKeyService {

  // RSA key size
  private keySize = 2048;

  /**
   * Generate an RSA public-private key pair using Web Crypto API and return keys in PEM format.
   * @returns Promise with generated public and private keys in PEM format
   */
  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    try {
      // Generate the RSA key pair
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5', // Algorithm name
          modulusLength: this.keySize, // Length of the key
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // Public exponent
          hash: { name: 'SHA-256' } // Hash function used for signing
        },
        true,  // Whether the key is extractable
        ['sign', 'verify']  // Usage of the keys
      );

      // Export the public and private keys in PEM format
      const publicKeyPEM = await this.exportPublicKey(keyPair.publicKey);
      const privateKeyPEM = await this.exportPrivateKey(keyPair.privateKey);

      // Log the generated keys
      console.log('Public Key is:', publicKeyPEM);
      console.log('Private Key is:', privateKeyPEM);

      // Return the keys as an object
      return { publicKey: publicKeyPEM, privateKey: privateKeyPEM };
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw error; // Propagate error if key generation fails
    }
  }

  /**
   * Export RSA public key in PEM format.
   * @param publicKey RSA public key to export
   * @returns PEM-formatted string of the public key
   */
  private async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    return this.arrayBufferToPem(exported, 'PUBLIC'); // Convert to PEM format
  }

  /**
   * Export RSA private key in PEM format.
   * @param privateKey RSA private key to export
   * @returns PEM-formatted string of the private key
   */
  private async exportPrivateKey(privateKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
    return this.arrayBufferToPem(exported, 'PRIVATE'); // Convert to PEM format
  }

  /**
   * Convert ArrayBuffer to a PEM string.
   * @param buffer ArrayBuffer to convert
   * @param keyType Either 'PUBLIC' or 'PRIVATE'
   * @returns PEM-formatted key string
   */
  private arrayBufferToPem(buffer: ArrayBuffer, keyType: string): string {
    const base64String = this.arrayBufferToBase64(buffer); // Convert to Base64
    // Format the key into PEM format with line breaks
    const formattedKey = base64String.match(/.{1,64}/g)?.join('\n') ?? '';
    return `-----BEGIN ${keyType} KEY-----\n${formattedKey}\n-----END ${keyType} KEY-----`;
  }

  /**
   * Convert ArrayBuffer to Base64 string.
   * @param buffer ArrayBuffer to convert
   * @returns Base64 encoded string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    // Convert bytes to binary string
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary); // Convert binary string to Base64
  }
}


--------------------
import { TestBed } from '@angular/core/testing';
import { RSAKeyService } from './rsa-key.service';

describe('RSAKeyService', () => {
  let service: RSAKeyService;

  // Mocking the Web Crypto API
  const mockExportKey = jest.fn();
  const mockGenerateKey = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      publicKey: {},
      privateKey: {}
    });
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RSAKeyService]
    });

    service = TestBed.inject(RSAKeyService);

    // Mock window.crypto.subtle
    (window.crypto.subtle as any) = {
      generateKey: mockGenerateKey,
      exportKey: mockExportKey
    };
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock history after each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate RSA key pair and return keys in PEM format', async () => {
    // Mock implementation for exportKey to return dummy ArrayBuffer
    mockExportKey.mockImplementation((format: string, key: CryptoKey) => {
      const buffer = new Uint8Array([/* some bytes */]).buffer;
      return Promise.resolve(buffer);
    });

    const keys = await service.generateKeyPair();
    expect(keys).toHaveProperty('publicKey');
    expect(keys).toHaveProperty('privateKey');

    expect(mockGenerateKey).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
      }),
      true,
      ['sign', 'verify']
    );
    expect(mockExportKey).toHaveBeenCalledTimes(2); // Called for public and private key export
  });

  it('should handle errors during key generation', async () => {
    mockGenerateKey.mockImplementationOnce(() => {
      return Promise.reject(new Error('Key generation error'));
    });

    await expect(service.generateKeyPair()).rejects.toThrow('Key generation error');
  });

  it('should export public key in PEM format', async () => {
    const publicKey = {};
    const pem = await service['exportPublicKey'](publicKey as CryptoKey);
    expect(pem).toMatch(/-----BEGIN PUBLIC KEY-----/);
    expect(pem).toMatch(/-----END PUBLIC KEY-----/);
  });

  it('should export private key in PEM format', async () => {
    const privateKey = {};
    const pem = await service['exportPrivateKey'](privateKey as CryptoKey);
    expect(pem).toMatch(/-----BEGIN PRIVATE KEY-----/);
    expect(pem).toMatch(/-----END PRIVATE KEY-----/);
  });

  it('should convert ArrayBuffer to PEM format correctly', () => {
    const arrayBuffer = new Uint8Array([1, 2, 3, 4]).buffer;
    const pem = service['arrayBufferToPem'](arrayBuffer, 'PUBLIC');
    expect(pem).toMatch(/-----BEGIN PUBLIC KEY-----/);
    expect(pem).toMatch(/-----END PUBLIC KEY-----/);
  });

  it('should convert ArrayBuffer to Base64 string correctly', () => {
    const arrayBuffer = new Uint8Array([1, 2, 3, 4]).buffer;
    const base64 = service['arrayBufferToBase64'](arrayBuffer);
    expect(base64).toBe('AQIDBAQ='); // Base64 of [1, 2, 3, 4]
  });
});
