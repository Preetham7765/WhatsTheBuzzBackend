const mongoose = require('mongoose');
const ScheduledEvent = require('../model/ScheduledEvent');
const Topic = require('../model/topic');
const  r = require('rethinkdb');
mongoose.connect('mongodb://admin:oosd-team-1@ds143683.mlab.com:43683/mern_tut');
var connection = null;
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
                    regionId: event.regionId,
                    comments: [],
                    startAt: event.startAt,
                    expireAt: event.expireAt,
                    topicType: event.topicType
                });
                r.connect({host: 'localhost', port: 28015}, function(err, conn) {
                    if(err) throw err;
                    connection =conn;
                    console.log(newTopic);
                    r.db('wtblive').table('topics').insert(JSON.parse(JSON.stringify(newTopic))).run(conn, (err, result)=>{
                        if (err) throw err;
                        console.log(JSON.stringify(result, null, 2));
                    });
                });
                newTopic.save().catch(err => console.log(err));

                //remove event from scheduled event
                ScheduledEvent.deleteOne({ _id: event._id }, (err) => console.log(err));
            });
        }
    );
}, 5000);

module.exports = scheduler;