const express = require('express');
const router = express.Router();
const cors = require('cors');
const request = require('request');


// topic model
const Topic = require('../../model/topic');
const Author = require('../../model/user');
const ScheduledEvent = require('../../model/ScheduledEvent');

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
            // console.log("sending topics", topics);
            res.json(topics);
        })
        .catch( error => {console.log("could not find any topics near by")});
});

//  @route POST api/topics
// @desc Create a post
// @access Public
router.post('/', (req,res)=> {
    Author.findById(req.body.author)
    .then(author => {
        //Have to create db.comments.createIndex( { "expireAt": 1 }, { expireAfterSeconds: 0 } ) in the database to make ttl active
        var currDate = new Date();
        var startDate, endDate, expireAtDateTime
        if(req.body.topicType === 'Event'){
            startDate = new Date(req.body.startAt);
            endDate = startDate.setMinutes(startDate.getMinutes() + req.body.duration);
        }else{
            currDate = new Date();
            expireAtDateTime = currDate.setMinutes(currDate.getMinutes() + req.body.duration);
        }

        const userLocation = [...req.body.location].map( el => parseFloat(el));
        request.post("http://127.0.0.1:5001/body",
            {json : userLocation},
            (err, res, body) => {
                console.log(body);
            })

        if(req.body.topicType === 'Event'){
            const newScheduledEvent = new ScheduledEvent({
                title: req.body.title,
                description: req.body.description,
                author: author,
                loc: { type: 'Point', coordinates: userLocation } ,
                comments:[],
                startAt: req.body.startAt,
                expireAt: req.body.expireAt,
                topicType: req.body.topicType
            })
            newScheduledEvent.save().then(user => res.json(user)).catch(error => console.log(error));
        }
        else {
            const newTopic = new Topic({
                title: req.body.title,
                description: req.body.description,
                author: author,
                loc: { type: 'Point', coordinates: userLocation } ,
                comments:[],
                startAt: Date.now(),
                expireAt: expireAtDateTime,
                topicType: req.body.topicType
            });
            newTopic.save().then(user => res.json(user)).catch(err => console.log(err));
        }
        // console.log(newTopic);
    })
    .catch(err => {console.log("undefined error here" , err)});
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
