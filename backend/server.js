const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron'); // Added for scheduling
const Complaint = require('./models/complaint'); // Import Complaint model
const complaintRoutes = require('./routes/complaintRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
console.log('Environment variables loaded:', {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    CLIENT_URL: process.env.CLIENT_URL
});

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS to allow multiple origins
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
}).then(() => console.log('MongoDB connected'))
  .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Cron job to update complaint statuses (runs every hour)
cron.schedule('* * * * *', async () => {
    console.log('Running complaint status update job...');
    try {
        const now = new Date();
        const oneHourAgo = new Date(now - 60 * 1000); // 1 hour ago
        const twoHoursAgo = new Date(now - 2 * 60 * 1000); // 2 hours ago

        // Update "pending" to "in_progress" after 1 hour
        const pendingUpdated = await Complaint.updateMany(
            { 
                status: 'pending', 
                createdAt: { $lte: oneHourAgo } 
            },
            { $set: { status: 'in_progress' } }
        );
        console.log(`Updated ${pendingUpdated.modifiedCount} complaints from pending to in_progress`);

        // Update "in_progress" to "resolved" after 2 hours
        const inProgressUpdated = await Complaint.updateMany(
            { 
                status: 'in_progress', 
                createdAt: { $lte: twoHoursAgo } 
            },
            { $set: { status: 'resolved' } }
        );
        console.log(`Updated ${inProgressUpdated.modifiedCount} complaints from in_progress to resolved`);
    } catch (error) {
        console.error('Error updating complaint statuses:', error);
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});