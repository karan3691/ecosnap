const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/user'); // Import User model

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Using express built-in JSON parser

// Test route to compare password (for debugging)
app.post('/test-password', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });

        // If the user does not exist, send a 400 response
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await user.comparePassword(password);

        // Respond with the result of password comparison
        res.status(200).json({ match: isMatch });
    } catch (error) {
        // Catch and send any errors
        res.status(500).json({ message: 'Error during password comparison', error: error.message });
    }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Import authentication routes
const authRoutes = require('./routes/authRoutes'); // Make sure this path is correct
app.use('/api/auth', authRoutes); // Use routes defined in authRoutes.js

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
