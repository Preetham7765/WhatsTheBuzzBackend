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
        const currDate = new Date();
        //Have to create db.comments.createIndex( { "expireAt": 1 }, { expireAfterSeconds: 0 } ) in the database to make ttl active
        const expireAtDateTime = currDate.setMinutes(currDate.getMinutes() + req.body.duration);
        const userLocation = [...req.body.location].map( el => parseFloat(el));
        console.log("location",userLocation);
        const newTopic = new Topic({title: req.body.title,description: req.body.description, author: author,
            loc: { type: 'Point', coordinates: userLocation } , comments:[], expireAt: expireAtDateTime});
        // console.log(newTopic);
        newTopic.save().then(user => res.json(user)).catch(err => console.log(err));
    })
    .catch(err => {console.log("Cannot find author" , req.body.author)});
    
});

// @route PUT api/topics
// @desc Add the vote
// @access Public
router.put('/upvote/:userid/:topicid/', cors(), (request, response) => {
    var authorId = null;
    Topic.findOneAndUpdate({ _id : request.params.topicid }, { $inc: { votes : 1 }, $push : { votedby : request.params.userid } })
        .then(item => {
            authorId = item.author;
            Author.findOneAndUpdate({_id :  authorId}, {$inc : {reputationScore : 2} })
                .catch(err => console.log(err));
            response.json(item);
        })
        .catch(err => console.log(err));
});

// @route PUT api/topics
// @desc Remove the vote
// @access Public
router.put('/downvote/:userid/:topicid/', cors(), (request, response) => {
    var authorId = null;
    Topic.findOneAndUpdate({ _id : request.params.topicid }, { $inc: { votes : -1 },  $pull : { votedby : request.params.userid } })
        .then(item => {
            authorId = item.author;
            Author.findOneAndUpdate({_id :  authorId}, {$inc : {reputationScore : -2}})
                .catch(err => console.log(err));
            response.json(item);
        })
        .catch(err => console.log(err));
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
