const mongoose = require('mongoose');
const UserBase = require('./bases/UserBase');

// Add fields that only ContentProducers should have. If everyone else
// should have the same fields, add it to UserBase instead.
module.exports = mongoose.model('ContentProducer', UserBase({
  contentOutlets: [
    {
      contentOutlet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContentOutlet'
      }
    }
  ]
}));
