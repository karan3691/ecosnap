const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,  // Automatically trims leading/trailing spaces
  },
  password: {
    type: String,
    required: true,
  }
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if password isn't modified
  try {
    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash password
    next(); // Move to next middleware (save)
  } catch (error) {
    console.error('Error while hashing password:', error); // Log errors
    next(error); // Pass error to next middleware or route handler
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (inputPassword) {
  try {
    // Debugging: Log input password and stored hash
    console.log('Comparing passwords');
    console.log('Input Password:', inputPassword);
    console.log('Stored Hash:', this.password);
  
    const match = await bcrypt.compare(inputPassword, this.password); // Compare input with stored hash
    console.log('Password comparison result:', match); // Log comparison result
  
    return match; // Return comparison result (true/false)
  } catch (error) {
    console.error('Error comparing password:', error); // Log comparison error
    throw new Error('Password comparison failed'); // Throw error to be handled by route
  }
};

module.exports = mongoose.model('User', userSchema); // Export user model
