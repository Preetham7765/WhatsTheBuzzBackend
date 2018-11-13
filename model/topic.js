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
    loc: {
        type: { type: String, enum: "Point", default: "Point"},
        coordinates: { type: [ Number ] },
    },
    expireAt :{
        type: Date,
    },
    votes: {
        type: Number,
        default: 0
    },
    votedby:{
        type: [mongoose.Schema.Types.ObjectId],
        default:[]
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
TopicSchema.index({"loc": "2dsphere"});
module.exports = Item = mongoose.model('topic', TopicSchema);