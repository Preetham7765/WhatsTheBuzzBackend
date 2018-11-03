const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const items = require('./routes/api/item.js');
const users = require('./routes/api/user.js');
const topics = require('./routes/api/topics.js');

const app = express();

//Body parser middleware
app.use(bodyParser.json());

// DB config
const db = require('./config/keys.js').mongoURI;

// connect to Mongo
mongoose.connect(db).then(()=>{
    console.log('MongoDB Connected');
}).catch(err => console.log(err));

// Use Routes
app.use('/api/items', items);
app.use('/api/users', users);
app.use('/api/topics', topics);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
