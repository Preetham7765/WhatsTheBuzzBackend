const express = require('express');
const router = express.Router();
const cors = require('cors');

const Comment = require('../../model/comment');
const User = require('../../model/user');

router.post('/', cors(), (request, response) => {
    const newComment =
        new Comment(
            {
                author: request.body.author,
                description: request.body.description,
            });

    newComment
        .save()
        .then(comment => response.json(comment))
        .catch(err => console.log(err));
});

router.get('/:pageNum', cors(), (request, response) => {
    const itemsPerRequest = 2;
    Comment.find()
        .sort({ votes : -1 })
        .skip(itemsPerRequest * (request.params.pageNum - 1))
        .limit(itemsPerRequest)
        .then(item => response.json(item))
        .catch(err => console.log(err));
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