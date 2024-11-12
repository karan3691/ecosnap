// middleware/verifyToken.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

// Middleware function to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from the Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        // Verify token using the JWT_SECRET from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded token data to req.user
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(403).json({ message: 'Invalid token.' });
    }
}

module.exports = verifyToken;
