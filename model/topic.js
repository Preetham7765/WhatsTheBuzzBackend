const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TopicSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
      type: String,
      required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: { type: String },
        coordinates: []
    },
    votes: {
        numbers: [Number],
        default: [0,0]
    },
    spamCount: {
        type: Number,
        default: 0
    },
    duplicateCount:{
        type: Number,
        default: 0
    },
    comments: [{
        type: Schema.ObjectId, ref: 'comment'
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Item = mongoose.model('topic', TopicSchema);