const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    votes: {
        type: Number,
        default: 0
    },
    votedby: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    spamCount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Item = mongoose.model('comment', CommentSchema);
