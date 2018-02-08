const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');

const routes = require('./routes');
const { User, ContentProducer, Business, Manager } = require('./models');
const { USER_ERROR, asyncMiddleware, errorHandler } = require('./util');

const PORT = process.env.PORT || '3003';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/capstone');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


routes(app);

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

module.exports = app;
