// Import the function to test

describe('getLaunchRemoteEntry', () => {
    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();
    });

    it('should return the correct remote entry URL with a random query parameter', () => {
        // Mock the crypto.getRandomValues method
        const mockCrypto = {
            getRandomValues: jest.fn((array: Uint32Array) => {
                array[0] = 123456789; // Mock a random value
                return array;
            }),
        };

        // Spy on the global crypto object
        Object.defineProperty(global, 'crypto', {
            value: mockCrypto,
            configurable: true,
        });

        // Call the function
        const result = getLaunchRemoteEntry();

        // Assert the correct base URL
        expect(result).toContain(
            'sad'
        );

        // Assert the random value is appended correctly
        expect(result).toContain('123456789');
    });

    it('should handle the absence of window.crypto gracefully', () => {
        // Remove crypto from the global object temporarily
        const originalCrypto = global.crypto;
        Object.defineProperty(global, 'crypto', {
            value: undefined,
            configurable: true,
        });

        expect(() => {
            getLaunchRemoteEntry();
        }).toThrow('window.crypto is not available');

        // Restore the original crypto object
        Object.defineProperty(global, 'crypto', {
            value: originalCrypto,
            configurable: true,
        });
    });

    it('should call crypto.getRandomValues with a Uint32Array', () => {
        const mockCrypto = {
            getRandomValues: jest.fn(),
        };

        Object.defineProperty(global, 'crypto', {
            value: mockCrypto,
            configurable: true,
        });

        getLaunchRemoteEntry();

        expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint32Array));
    });
});
