const mongoose = require('mongoose');
const ScheduledEvent = require('../model/ScheduledEvent');
const Topic = require('../model/topic');
mongoose.connect('mongodb://admin:oosd-team-1@ds143683.mlab.com:43683/mern_tut');

var scheduler = () => setInterval(() => {
    var currDateTime = new Date();
    //console.log("scheduler running");
    ScheduledEvent.find({ "startAt": { $lte: Math.floor(currDateTime) } },
        (err, scheduledEvents) => {
            if (err) {
                console.log(err);
                return;
            }
            if (scheduledEvents.length == 0) {
                return;
            }

            scheduledEvents.forEach((event) => {
                console.log("event moved");
                const newTopic = new Topic({
                    title: event.title,
                    description: event.description,
                    author: event.author,
                    loc: { type: 'Point', coordinates: event.loc.coordinates },
                    comments: [],
                    startAt: event.startAt,
                    expireAt: event.expireAt,
                    topicType: event.topicType
                });
                newTopic.save().catch(err => console.log(err));

                //remove event from scheduled event
                ScheduledEvent.deleteOne({ _id: event._id }, (err) => console.log(err));
            });
        }
    );
}, 5000);

module.exports = scheduler;