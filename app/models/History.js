const mongoose = require('mongoose');

const historyShema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users' 
    },
    action : {
        type: String,
        required : true
    },
    target : {
        type: mongoose.Schema.Types.Mixed, // Use Mongoose Mixed type for flexibility
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const History = mongoose.model('history', historyShema, 'history');

module.exports = History;