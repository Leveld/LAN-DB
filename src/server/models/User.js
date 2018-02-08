const mongoose = require('mongoose');
const UserBase = require('./bases/UserBase');

// this shouldn't add anything onto the UserBase as the other User types
// won't be expecting it.
module.exports = mongoose.model('User', UserBase());
