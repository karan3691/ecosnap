const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming your User model is in the models folder
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' }); // Success message
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    console.log('Attempting to log in user:', username); // Log the username
  
    try {
        const user = await User.findOne({ username });
        
        // If the user does not exist, log and return an error
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid username or password' });
        }
  
        console.log('User found:', user.username); // Log user found
  
        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch); // Log the result of password comparison
  
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ message: 'Invalid username or password' });
        }
  
        // Generate a token if the credentials are valid
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated JWT token:', token); // Log the generated token
  
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export routes
module.exports = router;
