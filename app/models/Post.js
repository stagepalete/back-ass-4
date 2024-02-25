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
        ref: 'users',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'topic',
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'community',
        required: true
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        comment : {
            type : String,
            required : true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    }]
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
