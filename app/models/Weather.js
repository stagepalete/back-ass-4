const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        unique: false
    },
    temp: {
        type: String,
        required: true,
        unique: false
    },
    condition: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Weather = mongoose.model('weather', weatherSchema, 'weather');

module.exports = Weather;
