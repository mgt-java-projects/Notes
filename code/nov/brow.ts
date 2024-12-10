private getCommonHeaders(options: HttpClientOptions = {}): HttpClientOptions {
  const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-request-id': v4(), // Assuming v4 is a UUID generator
      'Authorization': 'empty',
  };

  const mergedHeaders = {
      ...defaultHeaders,
      ...(options.headers || {}),
  };

  const ret: HttpClientOptions = {
      ...options,
      headers: mergedHeaders,
  };

  return ret;
}


it('should merge headers correctly in getCommonHeaders', () => {
  const options = {
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer token',
      },
  };

  // Use reflection to call the private method
  const result = (service as any).getCommonHeaders(options);

  expect(result.headers).toEqual({
      'Content-Type': 'application/x-www-form-urlencoded', // Overridden
      'x-request-id': 'mock-uuid', // Default value
      'Authorization': 'Bearer token', // Overridden
  });
});

it('should apply default headers when no headers are provided', () => {
  const result = (service as any).getCommonHeaders();

  expect(result.headers).toEqual({
      'Content-Type': 'application/json', // Default
      'x-request-id': 'mock-uuid', // Default
      'Authorization': 'empty', // Default
  });
});
