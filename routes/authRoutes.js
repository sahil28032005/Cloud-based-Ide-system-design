const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const router = express.Router();
const { exec } = require('child_process');
const JWT_SECRET = process.env.JWT_SECRET;
const path = require('path');
const scriptPath = '/usr/src/app/start-user-container.sh';

//regitsering route this will handle spinning docker containner also
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Spinning docker container for generating uuid for first time
    exec(scriptPath, async (err, stdout, stderr) => {
        if (err) {
            console.error(`Error: ${stderr}`);
            return res.status(500).send('Failed to generate userId');
        }

        // Otherwise extract userId from script logs or anything
        const userIdMatch = stdout.match(/User ID: (.*)/);
        if (!userIdMatch) {
            return res.status(500).send('Failed to extract user ID');
        }
        const userId = userIdMatch[1].trim();
        console.log(`Extracted User ID: ${userId}`);

        const user = new User({ username, password, userId });
        await user.save();
        res.status(201).send({ success: true, message: 'User registered successfully' });
    });
});

//login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = User.findOne({ username: username });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

module.exports = router;
