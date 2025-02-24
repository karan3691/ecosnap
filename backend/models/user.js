const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        console.error('Error while hashing password:', error);
        next(error);
    }
});

userSchema.methods.comparePassword = async function (inputPassword) {
    try {
        return await bcrypt.compare(inputPassword, this.password);
    } catch (error) {
        console.error('Error comparing password:', error);
        throw new Error('Password comparison failed');
    }
};

userSchema.virtual('complaints', {
    ref: 'Complaint',
    localField: '_id',
    foreignField: 'user'
});
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);