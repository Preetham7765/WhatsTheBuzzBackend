const express = require('express');
const router = express.Router();

// item model
const Reputation = require('../../model/reputation');

router.get('/', (req, res) => {
    Reputation.find()
        .sort({ date: -1 })
        .then(reps => res.json(reps));
});


//  @route GET api/items
// @desc Get all items
// @access Public
router.get('/:id', (req, res) => {
    Reputation.findById(req.params.id)
        .then(rep => res.json(rep).then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }));
});

//  @route POST api/items
// @desc Create a post
// @access Public////////
router.post('/', (req, res) => {
    const newReputation = new Reputation();
    newReputation.save().then(reputation => res.json(reputation));
});

//  @route Delete api/items/:id
// @desc Delete a item
// @access Public
router.delete('/:id', (req, res) => {
    Item.findById(req.params.id)
        .then(item => item.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;
