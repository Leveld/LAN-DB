const mongoose = require('mongoose');
const ManagerBase = require('./bases/ManagerBase');

// the only fields added to ManagerBase here should be fields that Business
// shouldn't have. If Business and Manager will have the same fields,
// add it to ManagerBase instead.
module.exports = mongoose.model('Manager', ManagerBase({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}));
