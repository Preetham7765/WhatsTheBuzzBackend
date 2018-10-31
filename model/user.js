const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    posts: [{type: Schema.ObjectId, ref: 'Events'}]
});

module.exports = Item = mongoose.model('user', ItemSchema);
