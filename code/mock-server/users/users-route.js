const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Function to load JSON files
const loadJsonFile = (filename) => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '', filename)));
};

// Load user success and failure JSON
const usersSuccess = loadJsonFile('success.json');
const usersFailure = loadJsonFile('failure.json');

// GET request for users
router.get('/', (req, res) => {
  const status = req.query.status;
  if (status === 'fail') {
    res.status(500).json(usersFailure);
  } else {
    res.json(usersSuccess);
  }
});

// POST request for users
router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Simulate success or failure based on request body
  if (!username || !password) {
    res.status(400).json(usersFailure);  // Missing required fields
  } else {
    res.status(201).json({
      status: 'success',
      message: `User ${username} created successfully!`,
      data: req.body // Return the posted data for confirmation
    });
  }
});

module.exports = router;
