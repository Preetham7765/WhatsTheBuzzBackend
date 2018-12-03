const express = require("express");
const nodemailer = require("nodemailer");
const passport = require("passport");
const config = require("../../config/keys");
require("../../config/passport")(passport);
const jwt = require("jsonwebtoken");
const router = express.Router();
const logout = require("express-passport-logout");

// item model
const User = require("../../model/user");
const Reputation = require("../../model/reputation");

//  @route GET api/items
// @desc Get all items
// @access Public
router.get("/", (req, res) => {
  User.find()
    .sort({ date: -1 })
    .then(users => res.json(users));
});


//  @route GET api/items
// @desc Get all items
// @access Public
router.post("/isUserPresent", (req, res) => {
  console.log("reached isUserPresent");

  console.log("reached lgin");
  console.log(req.body.username);
  //console.log(req.body.password);
  const user = new User({ username: req.body.username, signInMode: "google" });

  User.findOne({ username: req.body.username, signInMode: "google" }, function(
    err,
    user
  ) {
    console.log(user);
    if (err) {
      console.log(err);
      // return res.status(500).send();
      res.send({ success: false, message: "Could not connect to Database" });
    }

    if (!user) {
      console.log("not found");
      res.send({ success: false, message: "User not found" });
      //return res.status(404).send();
    }

    //return res.status(200).send();
    res.send({ success: true, userId: user._id, username: user.username });
  });
});

//  @route POST api/items
// @desc Create a post
// @access Public
router.post("/login", (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .then(user => {
      if (!user)
        res.status(401).json({
          success: false,
          msg: "Authentication failed. User not found."
        });
      else
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (!err && isMatch) {
            jwt.sign(
              user.toJSON(),
              config.secret,
              { expiresIn: 86400 * 7 },
              (err, token) => {
                res.status(200).json({
                  success: true,
                  token: "Bearer " + token,
                  data: {
                    userId: user._id,
                    enterpriseActive: user.enterpriseActive,
                    enterprise: user.enterprise
                  }
                });
              }
            );
          } else {
            res.status(401).json({
              success: false,
              msg: "Authentication failed. Wrong password."
            });
          }
        });
    })
    .catch(error => {
      throw error;
    });
});

//  @route POST api/items
// @desc Create a post
// @access Public
router.post("/register", (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.json({ success: false, msg: "Please send username and password" });
  } else {
    const newReputation = new Reputation().save().then(reputation => {
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        reputation: reputation.id,
        posts: []
      });

      newUser
        .save()
        .then(user =>
          res.json({ success: true, msg: "Successfully registered new user" })
        )
        .catch(err => {
          console.log(err);
          res.json({ success: false, msg: "Username already exists" });
        });
    });
  }
});

//  @route POST api/items
// @desc Create a post
// @access Public
router.post("/googleSignUp", (req, res) => {
  console.log("reached googleSignUp");
  const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    signInMode: "google",
    email: req.body.email,
    posts: []
  });
  console.log(newUser);
  newUser
    .save()
    .then(user => res.json(user))
    .catch(err => console.log(err));
  res.send({ success: true, userId: user._id, username: user.username });
});

function intimateUser(mailAddress) {
  //Turn on less secure apps over here https://myaccount.google.com/lesssecureapps
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "example@gmail.com",
      pass: "examplemailpassword"
    }
  });

  var mailOptions = {
    from: "example@gmail.com",
    to: mailAddress,
    subject: "Verification for Whats the buzz Enterprise Account",
    text: "Your account will be verified by one of our agents very soon"
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

router.post("/enterprise", (req, res) => {
  const newReputation = new Reputation().save().then(reputation => {
    const enterpriseUser = new User({
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      reputation: reputation.id,
      enterprise: true,
      enterpriseActive: "pending",
      posts: []
    });

    enterpriseUser.save().then(user => {
      res.status(200);
      res.json(user);
      //intimateUser(req.body.email);
    });
  });
});

//  @route Delete api/items/:id
// @desc Delete a item
// @access Public
router.delete("/:id", (req, res) => {
  User.findById(req.params.id)
    .then(item => item.remove().then(() => res.json({ success: true })))
    .catch(err => res.status(404).json({ success: false }));
});

router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById(req.params.id)
        .then(user => {
            if (user === null) {
                res.status(404);
                res.json({ errorMsg: "User not found" });
                return;
            }

            const data = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                reputationScore: user.reputationScore,
                checkins: 0, // we should take it from db
                buzzes: 6,
                upvotes: 10,
            }
            res.json(data);
        })
        .catch(error => {
            res.status(404);
            res.json({ errorMsg: error.message });
        });
})


router.get('/:id/reputation', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userId = req.params.id;
    User.findById(userId)
        .then((user) => {
            if (user === null) {
                res.status(400);
                res.json({ success: false, errorMsg: "Could not find user" });
                return;
            }
            if (!user.enterprise && user.reputationScore > 10 && user.posts.length == 0) {

                res.status(200);
                res.json({ success: true, errorMsg: "" });
                return;
            }
            res.status(200);
            console.log("user.reputationScore", user.reputationScore);
            if (user.reputationScore < 10)
                res.json({ success: false, errorMsg: "You don't not sufficient reputation" });
            else
                res.json({ success: false, errorMsg: "You already have a live buzz!" });
        })
        .catch(error => {
            res.status(400);
            res.json({ success: false, errorMsg: "Something went wrong in server " + error });
        })

});
router.get("/logout", logout());

/*router.get("/logout", function(req, res) {
  console.log("in logout");
  //req.logout();
  //res.redirect("/");
});*/

module.exports = router;
