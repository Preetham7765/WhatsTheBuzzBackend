const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    commentCtr: {
        type: Number,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    commentDesc: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Item = mongoose.model('comment', CommentSchema);
