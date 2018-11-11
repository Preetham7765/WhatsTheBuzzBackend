const express = require('express');
const router = express.Router();
const cors = require('cors');

const Comment = require('../../model/comment');

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

router.put('/upvote/:id/', cors(), (request, response) => {
    Comment.findOneAndUpdate({ _id : request.params.id }, { $inc: { votes : 1 } })
        .then(item => response.json(item))
        .catch(err => console.log(err));
});

router.put('/downvote/:id/', cors(), (request, response) => {
    Comment.findOneAndUpdate({ _id : request.params.id }, { $inc: { votes : -1 } })
        .then(item => response.json(item))
        .catch(err => console.log(err));
});

router.put('report/:id', cors(), (request, response) => {
    Comment.findOneAndUpdate({ _id : request.params.id }, { $inc: { spamCount : 1 } })
        .then(item => response.json(item))
        .catch(err => console.log(err));
});


module.exports = router;