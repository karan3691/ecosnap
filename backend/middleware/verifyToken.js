const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Invalid authorization format' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.exp * 1000 < Date.now()) {
            return res.status(401).json({ message: 'Token expired' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(403).json({ message: 'Invalid token' });
    }
}

module.exports = verifyToken;