const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
const fs = require('fs');
const router = express.Router();
const { exec } = require('child_process');
const JWT_SECRET = process.env.JWT_SECRET;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Function to create a user directory and handle Docker setup
function createUserWorkspace(userId) {
    const workspacePath = path.join('workspaces', userId);

    // Create user-specific directory
    if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
    }

    // Return the path to be used in the Docker setup
    return workspacePath;
}

// const scriptPath = path.resolve(__dirname, 'start-user-container.sh');

//regitsering route this will handle spinning docker containner also
// Endpoint to register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Generate a unique user ID
    const userId = uuidv4();  // Use a UUID library for generating unique IDs

    // Create the user's workspace directory
    const userWorkspace = createUserWorkspace(userId);

    // Save user details to the database
    const user = new User({ username, password, userId, workspacePath: userWorkspace });
    await user.save();

    // Respond with success
    res.status(201).send({ success: true, message: 'User registered successfully', userId });
});

//login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
   
});

module.exports = router;
