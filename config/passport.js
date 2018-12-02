const JwtStratergy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;


const User = require('../model/user');
const config = require('./keys');

module.exports   = (passport) => {

    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secret;
    passport.use(new JwtStratergy(opts, (jwt_payload, done) => {
        User.findById(jwt_payload._id)
            .then(user => {
                if (user)
                    done(null, user);
                else
                    done(null, false);
            })
            .catch(error => {
                return done(error, false);
            });
    }));
}