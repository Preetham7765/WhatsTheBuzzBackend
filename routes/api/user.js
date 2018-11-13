const express = require('express');
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

        return res.status(200).send();
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

//  @route Delete api/items/:id
// @desc Delete a item
// @access Public
router.delete('/:id', (req,res)=> {
    User.findById(req.params.id)
        .then(item => item.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

module.exports = router;
