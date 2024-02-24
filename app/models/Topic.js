const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    image : {
        type : String,
        required : true,
        unique : false
    },
    name : {
        type : String,
        required : true,
        unique : true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Topic = mongoose.model('topic', topicSchema, 'topic');

module.exports = Topic;