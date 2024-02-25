const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String, 
        required: true,
        unique: false
    },
    lastname: {
        type: String, 
        required: true,
        unique: false
    },
    avatar: {
        type: String,
        required: false,
        unique: false,
        default: '/images/profile/def.png'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        country: {
            type: String,
            required: false,
            default: 'None'
        },
        city: {
            type: String,
            required: false,
            default: 'None'
        }
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const User = mongoose.model('users', userSchema, 'users');

module.exports = User;
