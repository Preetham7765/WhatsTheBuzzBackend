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
router.post('/', (req,res)=> {
    const newUser = new User({username: req.body.username,
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
