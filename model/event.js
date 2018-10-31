const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const
const ItemSchema = new Schema({
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
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Item = mongoose.model('event', ItemSchema);