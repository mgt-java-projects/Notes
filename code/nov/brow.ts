app.get('/authorise', (req, res) => {
  const redirect_url = req.query.redirect_uri || 'default_redirect_url';
  const state = req.query.state || 'default_state';

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