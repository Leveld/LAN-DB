const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  kind: String,
  owner: { 
    type: ObjectID, 
    refPath: 'kind'
  }
});

module.exports = mongoose.model('Contract', ContractSchema);