app.get('/authorise', (req, res) => {
  const { redirect_uri, state, scope, response_type, client_id, code_challenge, code_challenge_method } = req.query;

    // Validate the required parameters
    if (!redirect_uri || !state || !scope || !response_type || !client_id || !code_challenge || !code_challenge_method) {
        return res.status(400).json({
            error: 'Invalid request parameters',
            missingParameters: [
                !redirect_uri && 'redirect_uri',
                !state && 'state',
                !scope && 'scope',
                !response_type && 'response_type',
                !client_id && 'client_id',
                !code_challenge && 'code_challenge',
                !code_challenge_method && 'code_challenge_method'
            ].filter(Boolean) // Remove null or undefined values
        });
    }

  res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <body>
          <p>Redirecting...</p>
          <form id="redirect_form" name="redirect_form" action="${redirect_url}" method="POST">
              <input type="hidden" name="code" value="LOCAL_TEST_AUTH_CODE" />
              <input type="hidden" name="state" value="${state}" />
          </form>
          <script>
              // Automatically submit the form
              document.getElementById('redirect_form').submit();
          </script>
      </body>
      </html>
  `);
});


app.post('/token', (req, res) => {
  const { grant_type, client_id, redirect_uri, code, client_secret, code_verifier } = req.body;

  // Validate the required fields (optional)
  if (!grant_type || !client_id || !redirect_uri || !code || !client_secret || !code_verifier) {
      return res.status(400).json({ error: 'Invalid request parameters' });
  }

  // Response object as specified
  const response = {
      access_token: "LOCAL_TEST_ACCESS_TOKEN",
      refresh_token: "LOCAL_TEST_REFRESH_TOKEN",
      scope: "launch",
      token_type: "bearer",
      expires_in: 599
  };

  // Send the response
  res.status(200).json(response);
});