const express = require('express');
const router = express.Router();
const cors = require('cors');
const request = require('request');
const passport = require('passport');
const r = require('rethinkdb');

// topic model
const Topic = require('../../model/topic');
const Author = require('../../model/user');
const ScheduledEvent = require('../../model/ScheduledEvent');
//  @route GET api/items
// @desc Get all items
// @access Public

var regionUserMap = new Map();
var userSocketMap = new Map();
var connection = null;
module.exports = function (io) {

    topicNsp = io.of('/topics');

    topicNsp.on('connection', (socket) => {

        console.log("Got connection request in topics");
        // {id: "", regions: []}
        socket.on("newUser", userInfo => {

            // add the new user to the userSocketMap
            userSocketMap.set(socket.id, userInfo.id);
            // add the new user to the regionSocketMap
            userInfo.regions.forEach(region => {
                if (regionUserMap.has(region)) {
                    let users = regionUserMap.get(region);
                    users.push(socket.id);
                    regionUserMap.set(region, users);
                }
                else {
                    regionUserMap.set(region, new Array(socket.id));
                }
                socket.join('room-' + region);
                console.log(socket.rooms);
            });
        });
        // { "id": "", regions: []}
        socket.on("deleteUser", userInfo => {
            // remove from the userSocketMap
            userSocketMap.delete(socket.id);

            // remove all user from all the entries in the regionSocketMap
            regionUserMap.forEach((value, key) => {
                regionUserMap.set(key, value.filter(el => el !== socket.id));
            });

            userInfo.regions.forEach(region => socket.leave('room-' + region));

        });
        // {"id": "", "title": "", "description": "" , location: ""}
        // send whatever u sent to the client


        // socket.on("newTopic", topic => {
        //     // assume it has a region
        //     socket.broadcast.to('room-' + topic.regionId).emit("updateTopic", topic);
        // });

    });

    r.connect({ host: '35.171.16.49' }, function (err, conn) {
        if (err) throw err;
        connection = conn;
        r.db('wtblive').table('topics')
            .changes()
            .run(connection, function (err, cursor) {
                if (err) { console.log("Error from rethinkdb", error); };
                cursor.each(function (err, row) {
                    if (err) throw err;
                    //working -emitting changes to client
                    if (row['new_val'] !== null){
                        console.log("topic.js: rethink broadcasting to clients ");
                        topicNsp.in('room-' + row['new_val']['regionId']).emit("updateTopic", row);
                    }
                });
            });
    });





    router.get('/', passport.authenticate('jwt', { session: false }), cors(), (req, res) => {
        const latitude = parseFloat(req.query.latitude);
        const longitude = parseFloat(req.query.longitude);
        console.log("lat, long ", latitude, longitude);
        Topic.find({
            "loc": {
                $geoWithin: {
                    $centerSphere: [[longitude, latitude], 3 / 6378]
                }
            }
        })
            .then(topics => {
                res.json(topics);
            })
            .catch(error => { console.log("could not find any topics near by") });
    });

    //  @route POST api/topics
    // @desc Create a post
    // @access Public
    router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
        Author.findById(req.body.author)
            .then(author => {
                //Have to create db.comments.createIndex( { "expireAt": 1 }, { expireAfterSeconds: 0 } ) in the database to make ttl active
                var currDate = new Date();
                var startDate, endDate, expireAtDateTime;
                if (req.body.topicType === 'Event') {
                    startDate = new Date(req.body.startAt);
                    endDate = new Date(req.body.expireAt);
                } else {
                    currDate = new Date();
                    expireAtDateTime = new Date(currDate);
                    expireAtDateTime.setMinutes(currDate.getMinutes() + parseInt(req.body.duration));
                }

                const userLocation = [...req.body.location].map(el => parseFloat(el));
                if (req.body.topicType === 'Event') {
                    const newScheduledEvent = new ScheduledEvent({
                        title: req.body.title,
                        description: req.body.description,
                        author: author,
                        regionId: req.body.region,
                        loc: { type: 'Point', coordinates: userLocation },
                        comments: [],
                        startAt: startDate,
                        expireAt: endDate,
                        topicType: req.body.topicType
                    });
                    newScheduledEvent.save().then(user => res.json(user)).catch(error => console.log(error));
                }
                else {
                    const newTopic = new Topic({
                        title: req.body.title,
                        description: req.body.description,
                        author: author,
                        regionId: req.body.region,
                        loc: { type: 'Point', coordinates: userLocation },
                        comments: [],
                        startAt: Date.now(),
                        expireAt: expireAtDateTime,
                        topicType: req.body.topicType
                    });
                    r.connect({ host: '35.171.16.49' }, function (err, conn) {
                        if (err) throw err;
                        connection = conn;
                        r.db('wtblive').table('topics').insert(JSON.parse(JSON.stringify(newTopic))).run(conn, (err, result) => {
                            if (err) throw err;
                            // console.log(JSON.stringify(result, null, 2));
                        });
                    });
                    newTopic.save().then(topic => {
                        res.json(topic);
                    }).catch(err => console.log(err));
                }
                // console.log(newTopic);
            })
            .catch(err => { console.log("undefined error here", err) });
    });

    // @route PUT api/topics
    // @desc Add the vote
    // @access Public
    router.put('/upvote/:userid/:topicid/', cors(), (request, response) => {
        var authorId = null;
        Topic.findOneAndUpdate({ _id: request.params.topicid }, { $inc: { votes: 1 }, $push: { votedby: request.params.userid } })
            .then(item => {
                authorId = item.author;
                Author.findOneAndUpdate({ _id: authorId }, { $inc: { reputationScore: 2 } })
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
        Topic.findOneAndUpdate({ _id: request.params.topicid }, { $inc: { votes: -1 }, $pull: { votedby: request.params.userid } })
            .then(item => {
                authorId = item.author;
                Author.findOneAndUpdate({ _id: authorId }, { $inc: { reputationScore: -2 } })
                    .catch(err => console.log(err));
                response.json(item);
            })
            .catch(err => console.log(err));
    });

    //  @route Delete api/items/:id
    // @desc Delete a item
    // @access Public
    router.delete('/:id', (req, res) => {
        Topic.findById(req.params.id)
            .then(item => item.remove().then(() => res.json({ success: true })))
            .catch(err => res.status(404).json({ success: false }));
    });

    return router;

}