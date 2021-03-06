const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const items = require('./routes/api/item.js');
const users = require('./routes/api/user.js');

const passport = require('passport');

const reputation = require('./routes/api/reputation');
const scheduler = require('./services/scheduler.js');

const app = express();


//Body parser middleware
app.use(bodyParser.json());

// DB config
const db = require('./config/keys.js').mongoURI;

// connect to Mongo
mongoose.connect(db).then(() => {
    console.log('MongoDB Connected');
}).catch(err => console.log(err));

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`)
    scheduler();
});

const io = require('socket.io')(server);

const topics = require('./routes/api/topic.js')(io);
const comments = require('./routes/api/comment.js')(io);

app.use(passport.initialize());

// Use Routes
app.use('/api/items', items);
app.use('/api/users', users);
app.use('/api/topics', topics);
app.use('/api/comments', comments);
app.use('/api/reputation', reputation);

module.exports = app;
