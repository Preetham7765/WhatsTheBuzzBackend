const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// item model
const User = require('../../model/user');

//  @route GET api/items
// @desc Get all items
// @access Public
router.get('/', (req,res)=> {
   User.find()
       .sort({date: -1})
       .then(users => res.json(users));
});



router.get('/:id', (req,res)=> {
    User.findById(req.params.id)
        .then(users => res.json(users).then(() => res.json({sucess: true})))
        .catch(err => res.status(404).json({success: false}));
});


//  @route GET api/items
// @desc Get all items
// @access Public
router.post('/isUserPresent', (req,res)=> {
    console.log("reached isUserPresent");

    console.log("reached lgin");
    console.log(req.body.username);
    //console.log(req.body.password);
    const user = new User({username: req.body.username,signInMode: 'google'});

    User.findOne({username: req.body.username,signInMode: 'google'}, function(err,user)
    {
        console.log(user);
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        if(!user){
            console.log("not found");
            return res.status(404).send();
        }

        return res.status(200).send();
    });

});


//  @route POST api/items
// @desc Create a post
// @access Public
router.post('/login', (req,res)=> {
    console.log("reached lgin");
    console.log(req.body.username);
    console.log(req.body.password);
    const user = new User({username: req.body.username,
        password: req.body.password});

    User.findOne({username: req.body.username,
        password: req.body.password}, function(err,user)
    {
        console.log(user);
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        if(!user){
            console.log("not found");
            return res.status(404).send();
        }

        return res.status(200).send({userId : user._id, enterpriseActive: user.enterpriseActive, enterprise: user.enterprise});
    });
    //newUser.save().then(user => res.json(user)).catch(err => console.log(err));
});

//  @route POST api/items
// @desc Create a post
// @access Public
router.post('/register', (req,res)=> {
    console.log("reached");
    const newUser = new User({firstName:req.body.firstName, lastName:req.body.lastName,username: req.body.username,
        password: req.body.password, posts: []});
    newUser.save().then(user => res.json(user)).catch(err => console.log(err));
});

//  @route POST api/items
// @desc Create a post
// @access Public
router.post('/googleSignUp', (req,res)=> {
    console.log("reached googleSignUp");
    const newUser = new User({firstName:req.body.firstName, lastName:req.body.lastName,username: req.body.username,
        signInMode: 'google', email:req.body.email, posts: []});
    console.log(newUser);
    newUser.save().then(user => res.json(user)).catch(err => console.log(err));
});

function intimateUser(mailAddress){

    //Turn on less secure apps over here https://myaccount.google.com/lesssecureapps
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'example@gmail.com',
            pass: 'examplemailpassword'
        }
    });

    var mailOptions = {
        from: 'example@gmail.com',
        to: mailAddress,
        subject: 'Verification for Whats the buzz Enterprise Account',
        text: 'Your account will be verified by one of our agents very soon'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}

router.post('/enterprise', (req, res) =>{
   const enterpriseUser = new User({
       firstname : req.body.firstname,
       lastname : req.body.lastname,
       email : req.body.email,
       username : req.body.username,
       password : req.body.password,
       enterprise : true,
       enterpriseActive: "pending",
       posts :[]
   })

    enterpriseUser.save()
        .then((user) => {
            res.status(200);
            res.json(user);
            //intimateUser(req.body.email);
        })
});


//  @route Delete api/items/:id
// @desc Delete a item
// @access Public
router.delete('/:id', (req,res)=> {
    User.findById(req.params.id)
        .then(item => item.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

module.exports = router;
