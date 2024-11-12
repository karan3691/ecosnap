const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/user'); // Import User model
const complaintRoutes = require('./routes/complaintRoutes'); // Import Complaint Routes

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Using express built-in JSON parser

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Import authentication routes
const authRoutes = require('./routes/authRoutes'); // Make sure this path is correct
app.use('/api/auth', authRoutes); // Use routes defined in authRoutes.js

// Register complaint routes
app.use('/api/complaints', complaintRoutes); // Ensure this is registered correctly

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
