const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: false,
    },
    location: {
        lat: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        lng: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Add index for sorting
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);