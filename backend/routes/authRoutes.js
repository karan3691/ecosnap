const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log('Register request received:', { username, password });

    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const existingUser = await User.findOne({ username });
        console.log('Existing user check:', existingUser ? 'User found' : 'No user found');
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ username, password });
        console.log('Saving new user:', newUser);
        await newUser.save();
        console.log('User saved successfully');
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request received:', { username });

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for:', username);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful, token generated:', token);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/user', verifyToken, async (req, res) => {
    try {
        console.log('Fetching user with ID:', req.user.userId);
        const user = await User.findById(req.user.userId, 'username');
        if (!user) {
            console.log('User not found for ID:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User data sent:', user);
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;