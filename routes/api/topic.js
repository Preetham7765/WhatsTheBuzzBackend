const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');


const app = express();
app.use(bodyParser.json());
app.use(logger('dev'));

const topicRouter = express.Router();


topicRouter.route("/")
.all((req,res,next) => {

})
.get((req,res) => {

})
.post((req,res) => {

});

module.export = topicRouter;