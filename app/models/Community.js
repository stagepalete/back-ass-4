const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique : true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }],
    comunityAva : {
        type : String,
        required : false,
        unique: false
    },
    comunityTopAva : {
        type : String,
        required: false,
        unique : false
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    rules: [{
        type: String
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

const Community = mongoose.model('community', communitySchema, 'community');

module.exports = Community;