// src/__mocks__/jose.ts
export const JWT = {
    verify: jest.fn((token: string, key: string) => {
      // Mock functionality for 'verify'
      return { payload: { a: "valueA", b: "valueB" } }; // Mock return object with `a` and `b`
    }),
    sign: jest.fn((payload: object, key: string) => {
      // Mock functionality for 'sign'
      return "mockSignedToken"; // Mock return value for a signed token
    }),
    decode: jest.fn((token: string) => {
      // Mock functionality for 'decode'
      return { a: "decodedValueA", b: "decodedValueB" }; // Mock return object with `a` and `b`
    }),
  };

  
  moduleNameMapper: {
    "^jose$": "<rootDir>/src/__mocks__/jose.ts", // Point to the mock file
  },