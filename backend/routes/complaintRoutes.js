const express = require('express');
const multer = require('multer');
const Complaint = require('../models/complaint');

const router = express.Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// Submit a new complaint
router.post('/', upload.single('image'), async (req, res) => {
    console.log(req.body); // Log the request body for debugging

    const newComplaint = new Complaint({
        user: req.body.user,
        description: req.body.description,
        imageUrl: req.file ? req.file.path : null,
        location: {
            lat: parseFloat(req.body.lat), // Ensure lat is a number
            lng: parseFloat(req.body.lng), // Ensure lng is a number
        },
    });

    try {
        const savedComplaint = await newComplaint.save();
        res.status(201).json(savedComplaint);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(400).json({ message: err.message });
    }
});

// Get all complaints
router.get('/', async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.status(200).json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
