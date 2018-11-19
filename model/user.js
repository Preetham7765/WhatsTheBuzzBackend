const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname:{
        type : String,
        required: true
    },
    email:{
        type : String,
        required : true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    enterprise: {
        type : Boolean,
        default : false
    },
    enterpriseActive: {
        type : String,
        default : ""
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
