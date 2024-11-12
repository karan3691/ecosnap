const express = require('express');
const multer = require('multer');
const Complaint = require('../models/complaint');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken'); // Corrected import path for verifyToken

const router = express.Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Image will be saved in 'uploads/' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Save with unique filename
    },
});

const upload = multer({ storage: storage });

// Post route to create a new complaint
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    console.log('Decoded user from token:', req.user); // Log the decoded user object

    // Ensure that userId exists in req.user
    if (!req.user || !req.user.userId) {
        return res.status(400).json({ message: 'User ID not found in token' });
    }

    // Create a new complaint, passing the userId from the decoded token
    const newComplaint = new Complaint({
        user: req.user.userId, // Correctly use userId from decoded token
        description: req.body.description,
        imageUrl: req.file ? req.file.path : null,
        location: {
            lat: parseFloat(req.body.lat), // Ensure lat is a number
            lng: parseFloat(req.body.lng), // Ensure lng is a number
        },
    });

    try {
        const savedComplaint = await newComplaint.save();
        res.status(201).json(savedComplaint); // Respond with the saved complaint
    } catch (err) {
        console.error('Error saving complaint:', err);
        res.status(400).json({ message: err.message });
    }
});

// Get route to fetch all complaints
router.get('/', async (req, res) => {
    try {
        // Fetch all complaints from the database and populate the 'user' field with 'username'
        const complaints = await Complaint.find().populate('user', 'username'); 
        res.status(200).json(complaints); // Return complaints to the client
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ message: err.message });
    }
});




module.exports = router;
