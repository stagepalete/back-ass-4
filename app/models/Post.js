const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    topic : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Topic',
        required : true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community', 
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment' 
    }],
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
