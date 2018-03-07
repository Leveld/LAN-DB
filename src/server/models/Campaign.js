const mongoose = require('mongoose');
const { userTypes } = require('./User');
const transform = require('./transform');

const Campaign = mongoose.Schema({
  contracts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  }],
  owner: {
    ownerType: {
      type: String,
      enum: userTypes,
      required: true
    },
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'owner.ownerType',
      required: true
    }
  },
  status: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  preferredApplicant: {
    coType: {
      type: String,
      required: true
    },
    minViews: {
      type: Number,
      default: 0
    },
    minSubscribers: {
      type: Number,
      default: 0
    },
    industry: {
      type: String,
      required: true
    }
  },
  description: {
    type: String
  },
  contractTemplate: {
    payout: {
      amount: {
        type: Number
      },
      payoutType: {
        type: String
      }
    },
    contractLength: {
      type: Number
    },
    name: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    advertiser: {
      advertiserType: {
        type: String,
        enum: userTypes,
        default: function() {
          return this.owner.ownerType
        }
      },
      advertiserID: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'contractTemplate.advertiser.advertiserType',
        default: function() {
          return this.owner.ownerID
        }
      }
    }
  },
  rules: [{
    type: String
  }]
}, { timestamps: true });

Campaign.set('toObject', { minimize: false, versionKey: false, virtuals: true, transform });

module.exports = mongoose.model('Campaign', Campaign);
