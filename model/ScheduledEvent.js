const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ScheduledEvent = new Schema({
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
    loc: {
        type: { type: String, enum: "Point", default: "Point" },
        coordinates: { type: [Number] },
    },
    regionId: {
        type: String,
        required: true
    },
    startAt: {
        type: Date,
    },
    expireAt: {
        type: Date,
    },
    topicType: {
        type: String,
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    votedby: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    spamCount: {
        type: Number,
        default: 0
    },
    duplicateCount: {
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
module.exports = Item = mongoose.model('scheduledEvent', ScheduledEvent);