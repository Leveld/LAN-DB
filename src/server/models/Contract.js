const mongoose = require('mongoose');

const Contract = mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  payout: {
    amount: {
      type: Number,
      required: true
    },
    payoutType: {
      type: String,
      enum: ['Per Video', 'Daily', 'Weekly', 'Monthly', 'Bi-Weekly', 'Monthly', 'On Completion'],
      required: true
    }
  },
  contractLength: {
    type: Number,
    required: true
  },
  advertiser: {
    advertiserType: {
      type: String,
      required: true
    },
    advertiserID: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'advertiser.advertiserType',
      required: true
    }
  },
  contentProducer: {
    contentProducerType: {
      type: String,
      required: true
    },
    contentProducerID: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'contentProducer.contentProducerType',
      required: true
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Frozen', 'Terminated', 'Closed', 'Completed'],
    default: 'Inactive'
  }
}, { timestamps: true });

Contract.set('toObject', { minimize: false, versionKey: false, virtuals: true });

module.exports = mongoose.model('Contract', Contract);
