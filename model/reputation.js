const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const ReputationSchema = new Schema({
    upVotes: {
        type: Number,
        default: 0
    },
    checkIns: {
        type: Number,
        default: 0
    },
    buzzes: {
        type: Number,
        default: 0
    },
    reviews: {
        type: Number,
        default: 0
    }
});

module.exports = Reputation = mongoose.model('reputation', ReputationSchema);