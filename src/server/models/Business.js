const mongoose = require('mongoose');
const ManagerBase = require('./bases/ManagerBase');

// The only fields added here should be fields that only Business
// should have. If Manager and Business will have the same fields,
// add them to ManagerBase instead.
module.exports = mongoose.model('Business', ManagerBase({
  businessName: {
    type: String,
    required: true
  }
}));
