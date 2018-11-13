const express = require('express');
const router = express.Router();
const cors = require('cors');

// topic model
const Topic = require('../../model/topic');
const Author = require('../../model/user');

//  @route GET api/items
// @desc Get all items
// @access Public
router.get('/', cors(),(req,res)=> {
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);
    console.log("lat, long ", latitude, longitude);
    Topic.find({
            "loc": {
                $geoWithin : {
                    $centerSphere: [[longitude, latitude], 4/6378]
                }
                
            
        }})
        .then(topics => {
            console.log("sending topics", topics);
            res.json(topics);
        })
        .catch( error => {console.log("could not find any topics near by")});
});

//  @route POST api/topics
// @desc Create a post
// @access Public
router.post('/', (req,res)=> {
    Author.findOne({'username': req.body.author})
    .then(author => {
        const userLocation = [...req.body.location].map( el => parseFloat(el));
        console.log("location",userLocation);
        const newTopic = new Topic({title: req.body.title,description: req.body.description, author: author,
            loc: { type: 'Point', coordinates: userLocation } , comments:[]});
        // console.log(newTopic);
        newTopic.save().then(user => res.json(user)).catch(err => console.log(err));
    })
    .catch(err => {console.log("Cannot find author" , req.body.author)});
    
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
