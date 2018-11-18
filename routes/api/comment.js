const express = require('express');
const router = express.Router();
const cors = require('cors');

const Comment = require('../../model/comment');
const User = require('../../model/user');
const Author = require('../../model/user');
const Topic = require('../../model/topic');

router.post('/', cors(), (request, response) => {

    Author.findById(request.body.authorId)
    .then((author) => {
        if(author == null)
            throw new Error("Could not find author");
        
        return Promise.all([ Topic.findById(request.body.topicId), author]);
    })
    .then( ([topic, author]) => {
        const newComment =
        new Comment(
            {
                author: author._id,
                description: request.body.comment,
            });

        return Promise.all([newComment.save(), topic])
        
    })
    .then(([comment, topic])=> {
        console.log("Comment",comment);
        topic.comments.push(comment._id);
        console.log("topic",topic);
        topic.save();
        response.status(200);
        response.statusMessage ="OK";
        response.end()
    })
    .catch((error)=> {
        console.log("error",error);
        response.status(400);
        response.statusMessage = "Malformed data";
        reponse.end()

    });
});

router.get('/:topicId', cors(), (request, response) => {
    const itemsPerRequest = 2;
    const topicId = request.params.topicId;
    console.log(topicId);
    respMsg = [];
    Topic.findOne({"_id":topicId})
    .populate({path:'comments', options: {sort : { 'date': "descending" }}})
    .exec()
    .then( topic => {

        const asyncLoop = (itr, callback) => {

            if ( itr < topic.comments.length){

                comment = topic.comments[itr];
                Author.findById(comment.author)
                .then( author => {
                    respMsg.push({                
                    _id: comment._id,
                    text: comment.description,
                    createdAt: comment.date,
                    user : {
                        _id: comment.author,
                        name: author.username,
                        avtar: '' 
                        }
                    });
                    asyncLoop(itr+1 , callback);
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
    .catch( error => {
        console.log("Error", error);
        response.status(404);
        response.statusMessage = "Topic not found";
        reponse.end()
    });

    /*
    Comment.find()
        .sort({ votes : -1 })
        .skip(itemsPerRequest * (request.params.pageNum - 1))
        .limit(itemsPerRequest)
        .then(item => response.json(item))
        .catch(err => console.log(err));*/
});

router.put('/upvote/:userid/:commentid/', cors(), (request, response) => {
    var authorId = null;
    Comment.findOneAndUpdate({ _id : request.params.commentid }, { $inc: { votes : 1 }, $push : { votedby : request.params.userid } })
        .then(item => {
            authorId = item.author;
            User.findOneAndUpdate({_id :  authorId}, {$inc : {reputationScore : 1} })
                .catch(err => console.log(err));
            response.json(item);
        })
        .catch(err => console.log(err));

});

router.put('/downvote/:userid/:commentid/', cors(), (request, response) => {
    var authorId = null;
    Comment.findOneAndUpdate({ _id : request.params.commentid }, { $inc: { votes : -1 },  $pull : { votedby : request.params.userid } })
        .then(item => {
            authorId = item.author;
            User.findOneAndUpdate({_id :  authorId}, {$inc : {reputationScore : -1}})
                .catch(err => console.log(err));
            response.json(item);
        })
        .catch(err => console.log(err));

});

router.put('report/:id', cors(), (request, response) => {
    Comment.findOneAndUpdate({ _id : request.params.id }, { $inc: { spamCount : 1 } })
        .then(item => response.json(item))
        .catch(err => console.log(err));
});


module.exports = router;