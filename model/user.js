const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');


const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    enterprise: {
        type: Boolean,
        default: false
    },
    enterpriseActive: {
        type: String,
        default: ""
    },
    rank: {
        type: Number,
        default: 0
    },
    reputationScore: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    signInMode: {
        type: String,
        default: "App"
    },
    posts: [{ type: Schema.ObjectId, ref: 'topic' }]
});


UserSchema.pre('save', function (next) {

    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return next(error);
            }
            bcrypt.hash(this.password, salt, null, (err, hash) => {
                if (err) {
                    return next(error);
                }
                this.password = hash;
                next();
            });
        });
    }
    else {
        next();
    }

});


UserSchema.methods.comparePassword = function(pwd, cb){
    bcrypt.compare(pwd, this.password, (err, IsMatch) => {
        console.log(err);
        if (err) {
            return cb(err, false);
        }
        cb(null, IsMatch);
    });
}
module.exports = Item = mongoose.model('user', UserSchema);
