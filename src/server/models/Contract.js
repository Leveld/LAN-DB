const axios = require('axios');
const mongoose = require('mongoose');

const Contract = mongoose.Schema({
  payout: {
    type: String,
    require: true
  },
  payoutType: {
    type: String,
    require: true
  },
  contractLength: {
    type: String,
    require: true
  }
});


module.exports = mongoose.model('Contract', Contract);
