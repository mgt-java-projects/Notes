const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Function to load JSON files
const loadJsonFile = (filename) => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '', filename)));
};

// Load post success and failure JSON
const postsSuccess = loadJsonFile('success.json');
const postsFailure = loadJsonFile('failure.json');

// GET request for posts
router.get('/', (req, res) => {
  const status = req.query.status;
  if (status === 'fail') {
    res.status(500).json(postsFailure);
  } else {
    res.json(postsSuccess);
  }
});

// POST request for posts
router.post('/', (req, res) => {
  const { title, content, author } = req.body;

  // Simulate success or failure based on request body
  if (!title || !content || !author) {
    res.status(400).json(postsFailure);  // Missing required fields
  } else {
    res.status(201).json({
      status: 'success',
      message: `Post titled "${title}" created successfully!`,
      data: req.body // Return the posted data for confirmation
    });
  }
});

module.exports = router;
