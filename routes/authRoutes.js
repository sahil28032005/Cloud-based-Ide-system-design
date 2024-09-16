const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

//regitsering route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).send({ success: true, message: 'user registered successfully' });
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
