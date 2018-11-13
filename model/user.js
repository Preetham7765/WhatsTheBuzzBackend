const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rank:{
        type: Number,
        default: 0
    },
    reputationScore: {
        type : Number,
        default : 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    posts: [{type: Schema.ObjectId, ref: 'topic'}]
});

module.exports = Item = mongoose.model('user', UserSchema);
