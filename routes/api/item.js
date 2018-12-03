const express = require('express');
const router = express.Router();
const passport = require('passport');

// item model
const Item = require('../../model/item');

//  @route GET api/items
// @desc Get all items
// @access Public
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const token = getToken(req.headers);
    if (token)
        Item.find()
            .sort({date: -1})
            .then(items => res.json(items));
});

//  @route POST api/items
// @desc Create a post
// @access Public
router.post('/', (req, res) => {
    const newItem = new Item({name: req.body.name});
    newItem.save().then(item => res.json(item));
});

//  @route Delete api/items/:id
// @desc Delete a item
// @access Public
router.delete('/:id', (req, res) => {
    Item.findById(req.params.id)
        .then(item => item.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

const getToken = (headers) => {
    if (headers && headers.authorization) {
        let parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};


module.exports = router;
