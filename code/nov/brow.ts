pprivate getCommonHeaders(options: HttpClientOptions = {}): HttpClientOptions {
  const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-request-id': v4(), // Generate a default UUID
      'Authorization': 'empty',
  };

  // Override default headers with input headers
  const mergedHeaders = {
      ...defaultHeaders, // Default headers first
      ...(options.headers || {}), // Input headers override defaults
  };

  // Ensure no duplicate headers
  const sanitizedHeaders = Object.keys(mergedHeaders).reduce((acc, key) => {
      acc[key.toLowerCase()] = mergedHeaders[key];
      return acc;
  }, {} as Record<string, string>);

  return {
      ...options,
      headers: sanitizedHeaders,
  };
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



app.use(express.urlencoded({ extended: true }));
// Middleware to parse application/x-www-form-urlencoded
router.use(express.urlencoded({ extended: true }));


const express = require('express');
const router = express.Router();

// Middleware to parse application/x-www-form-urlencoded
router.use(express.urlencoded({ extended: true }));

// POST route to create auth token
router.post('/oauth/oauth20/token', (req, res) => {
    const {
        grant_type,
        client_id,
        redirect_uri,
        code,
        client_secret,
        code_verifier,
    } = req.body;

    // Validate the required fields
    if (
        !grant_type ||
        !client_id ||
        !redirect_uri ||
        !code ||
        !client_secret ||
        !code_verifier
    ) {
        return res
            .status(400)
            .json({ error: 'Invalid request parameters' });
    }

    // Response object as specified
    const response = {
        access_token: 'LOCAL_TEST_ACCESS_TOKEN',
        refresh_token: 'LOCAL_TEST_REFRESH_TOKEN',
        scope: 'launch',
        token_type: 'bearer',
        expires_in: 599,
    };

    // Send the response
    res.status(200).json(response);
});

module.exports = router;
