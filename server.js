const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const items = require('./routes/api/item.js');

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

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
