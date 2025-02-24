const express = require('express');
const multer = require('multer');
const Complaint = require('../models/complaint');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// routes/complaintRoutes.js
// routes/complaintRoutes.js
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { description, lat, lng } = req.body;
        console.log('Received complaint data:', { description, lat, lng, file: req.file });
        if (!description || !lat || !lng) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['description', 'lat', 'lng']
            });
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (isNaN(latNum) || isNaN(lngNum)) {
            return res.status(400).json({ message: 'Invalid coordinates format' });
        }

        const newComplaint = new Complaint({
            user: req.user.userId,
            description,
            imageUrl: req.file?.path,
            location: { lat: latNum, lng: lngNum }
        });

        const savedComplaint = await newComplaint.save();
        console.log('Complaint saved:', savedComplaint);
        res.status(201).json(savedComplaint);
    } catch (err) {
        console.error('Error saving complaint:', err);
        res.status(400).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/my-complaints', verifyToken, async (req, res) => {
    try {
        const complaints = await Complaint
            .find({ user: req.user.userId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (err) {
        console.error('Error fetching user complaints:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;