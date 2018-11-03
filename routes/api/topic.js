const express = require('express');
const router = express.Router();

// item model
const Topic = require('../../model/topic');

//  @route GET api/items
// @desc Get all items
// @access Public
router.get('/', (req,res)=> {
    Topic.find()
        .sort({date: -1})
        .then(users => res.json(users));
});

//  @route POST api/topics
// @desc Create a post
// @access Public
router.post('/', (req,res)=> {
    const newTopic = new Topic({title: req.body.title,description: req.body.description,author: req.body.author,
        location: req.body.location, comments:[]});
    newTopic.save().then(user => res.json(user)).catch(err => console.log(err));
});

//  @route Delete api/items/:id
// @desc Delete a item
// @access Public
router.delete('/:id', (req,res)=> {
    Topic.findById(req.params.id)
        .then(item => item.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

module.exports = router;
