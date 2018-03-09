const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { IS_PRODUCTION } = require('capstone-utils');

const routes = require('./routes');

// initialize models
const {
  Business, Campaign, ContentOutlet,
  ContentProducer, Contract,
  Conversation, Manager, Message, User
} = require('./models');

const PORT = process.env.PORT || '3003';

mongoose.Promise = global.Promise;
if (IS_PRODUCTION)
  mongoose.connect(`mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@ds263138.mlab.com:63138/heroku_t3p057c7`);
else
  mongoose.connect('mongodb://localhost:2001/capstone');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

routes(app);

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Running in ' + (process.env.PRODUCTION ? 'Production' : 'Development'));
});

module.exports = app;
