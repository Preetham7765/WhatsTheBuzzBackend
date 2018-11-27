const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName:{
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
        required: false
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
    signInMode: {
        type: String,
        default: "App"
    },
    posts: [{type: Schema.ObjectId, ref: 'topic'}]
});

module.exports = Item = mongoose.model('user', UserSchema);
