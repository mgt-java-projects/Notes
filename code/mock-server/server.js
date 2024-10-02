const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON request body
app.use(bodyParser.json());

// Import routes
const userRoutes = require('./users/users-route');
const postRoutes = require('./posts/posts-route');

// Use routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);

// Start server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});
