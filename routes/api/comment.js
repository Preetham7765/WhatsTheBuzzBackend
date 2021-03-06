const express = require('express');
const router = express.Router();
const cors = require('cors');
const passport = require('passport');

const Comment = require('../../model/comment');
const User = require('../../model/user');
const Author = require('../../model/user');
const Topic = require('../../model/topic');

var clientList = {}

module.exports = function (io) {

    let commentNsp = io.of('/comments');

    commentNsp.on('connection', (socket) => {
        console.log("Got connection request in comments");

        socket.on("addUser", (topicId) => {
            console.log("Adding new user to  chat room", topicId);
            clientList[socket.id] = topicId;
            socket.join('room-' + topicId);
        });

        socket.on("removeUser", (topicId) => {
            console.log("remove user to  chat room", topicId);
            socket.leave("room-" + topicId);
            delete clientList[socket.id];
        });

        socket.on("editComment", (data) => {
            console.log("tend to edit comment");
            Comment.findById(data._id)
                .then((comment) => {
                    if (comment == null) {
                        throw new Error("Try to edit comment not exist");
                    }
                    comment.description = data.commentDesc;
                    comment.save();
                    console.log("send edit server");
                    socket.broadcast.to('room-' + clientList[socket.id]).emit("editComment", comment);
                    socket.emit("editComment", comment);
                })
                .catch((error) => {
                    console.log("edit error", error);
                });
        });

        socket.on("deleteComment", (data) => {
            console.log("tend to delete comment");
            console.log("id : " + data._id);
            Comment.deleteOne({ _id: data._id })
                .then(item => {
                    socket.broadcast.to('room-' + clientList[socket.id]).emit("deleteComment", data);
                    socket.emit("deleteComment", data);
                })
                .catch(err => console.log(err));
        });

        socket.on("addNewComment", (data) => {
            let newCommentData = {};
            console.log("add new comment", data);
            Author.findById(data.authorId)
                .then((author) => {
                    if (author == null)
                        throw new Error("Could not find author");

                    newCommentData.user = {};
                    newCommentData.user._id = author._id;
                    newCommentData.user.name = author.username;
                    newCommentData.user.avtar = '';
                    return Promise.all([Topic.findById(data.topicId), author]);
                })
                .then(([topic, author]) => {
                    const newComment =
                        new Comment(
                            {
                                author: author._id,
                                description: data.comment,
                            });

                    return Promise.all([newComment.save(), topic])

                })
                .then(([comment, topic]) => {
                    topic.comments.push(comment._id);
                    topic.save();
                    // response.status(200);
                    // response.statusMessage = "OK";
                    // response.end()
                    newCommentData._id = comment._id;
                    newCommentData.text = comment.description;
                    newCommentData.position = topic.comments.length - 1;
                    newCommentData.createdAt = comment.date;
                    newCommentData.votes = 0;
                    newCommentData.votedby = [];
                    console.log("broadcasting to all chat room ", clientList);
                    socket.broadcast.to('room-' + clientList[socket.id]).emit("newComment", newCommentData);
                    socket.emit("addCommentStatus", newCommentData);
                    // socket.emit("newComment", newCommentData);
                })
                .catch((error) => {
                    console.log("error", error);
                    // response.status(400);
                    // response.statusMessage = "Malformed data";
                    // reponse.end()
                    socket.emit("addCommentStatus", newCommentData);

                });

        });

        socket.on("voteUpComment", (data) => {
            Comment.findOneAndUpdate({ _id: data._id }, { $inc: { votes: 1 }, $push: { votedby: data.user } }, { new: true })
                .then(item => {
                    socket.broadcast.to('room-' + clientList[socket.id]).emit("vote", item);
                    socket.emit("vote", item);
                    authorId = item.author;
                    User.findOneAndUpdate({ _id: authorId }, { $inc: { reputationScore: 1 } })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        });

        socket.on("voteDownComment", (data) => {
            Comment.findOneAndUpdate({ _id: data._id }, { $inc: { votes: -1 }, $pull: { votedby: data.user } }, { new: true })
                .then(item => {
                    authorId = item.author;
                    User.findOneAndUpdate({ _id: authorId }, { $inc: { reputationScore: -1 } })
                        .catch(err => console.log(err));
                    socket.broadcast.to('room-' + clientList[socket.id]).emit("vote", item);
                    socket.emit("vote", item);
                })
                .catch(err => console.log(err));
        });

        socket.on("voteUpTopic", (data) => {
            Topic.findOneAndUpdate({ _id: data._id }, { $inc: { votes: 1 }, $push: { votedby: data.user } }, { new: true })
                .then(item => {
                    socket.broadcast.to('room-' + clientList[socket.id]).emit("vote", item);
                    socket.emit("vote", item);
                    authorId = item.author;
                    User.findOneAndUpdate({ _id: authorId }, { $inc: { reputationScore: 2 } })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        });

        socket.on("voteDownTopic", (data) => {
            Topic.findOneAndUpdate({ _id: data._id }, { $inc: { votes: -1 }, $pull: { votedby: data.user } }, { new: true })
                .then(item => {
                    authorId = item.author;
                    User.findOneAndUpdate({ _id: authorId }, { $inc: { reputationScore: -2 } })
                        .catch(err => console.log(err));
                    socket.broadcast.to('room-' + clientList[socket.id]).emit("vote", item);
                    socket.emit("vote", item);
                })
                .catch(err => console.log(err));
        });


        //getting connection request means 
        // create a room for each topic
        // check if a room with this topic is present
        // if present add the current user to the room
        // otherwise create
    });

    router.get('/:topicId', passport.authenticate('jwt', { session: false }), cors(), (request, response) => {

        const topicId = request.params.topicId;

        Topic.findOne({ "_id": topicId })
            .populate({ path: 'comments', options: { sort: { 'date': "ascending" } } })
            .exec()
            .then(topic => {

                let respMsg = {
                    topic: {
                        _id: topic._id,
                        author: null,
                        title: topic.title,
                        location: topic.loc.coordinates,
                        time: topic.date,
                        description: topic.description,
                        comments: [],
                        votes: topic.votes,
                        votedby: topic.votedby
                    }
                }

                Author.findById(topic.author)
                    .then(author => {
                        respMsg.topic.author = author.username
                        const asyncLoop = (itr, callback) => {
                            if (itr < topic.comments.length) {

                                comment = topic.comments[itr];
                                Author.findById(comment.author)
                                    .then(author => {
                                        respMsg.topic.comments.push({
                                            _id: comment._id,
                                            position: itr,
                                            text: comment.description,
                                            createdAt: comment.date,
                                            votes: comment.votes,
                                            votedby: comment.votedby,
                                            user: {
                                                _id: comment.author,
                                                name: author.username,
                                                avtar: ''
                                            }
                                        });
                                        asyncLoop(itr + 1, callback);
                                    });
                            }
                            else {
                                callback();
                            }
                        }
                        asyncLoop(0, () => {
                            console.log("Response Message ", respMsg);
                            response.status(200)
                            response.json(respMsg);
                        });
                    })
                    .catch(error => {
                        throw new Error("Topic Author not found");
                    });
            })
            .catch(error => {
                console.log("Error", error);
                response.status(404);
                response.statusMessage = "Topic not found";
                reponse.end()
            });
    });

    router.put('report/:id', cors(), (request, response) => {
        Comment.findOneAndUpdate({ _id: request.params.id }, { $inc: { spamCount: 1 } })
            .then(item => response.json(item))
            .catch(err => console.log(err));
    });

    return router;
}

/*














});

router.get('/:topicId', cors(), (request, response) => {

    console.log("inside get comments");
    webSocket = response.io;

    websocket.on('connection', (socket) => {



        const topicId = request.params.topicId;
        console.log(topicId);

        socket.emit("messages", "Hello");

        /*

    /*
    Comment.find()
        .sort({ votes : -1 })
        .skip(itemsPerRequest * (request.params.pageNum - 1))
        .limit(itemsPerRequest)
        .then(item => response.json(item))
        .catch(err => console.log(err));*/
/*});

module.exports = router;*/