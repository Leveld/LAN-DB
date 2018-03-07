const mongoose = require('mongoose');
const { forEachAsync, mapAsync } = require('capstone-utils');
const Message = require('./Message');
const { userTypes } = require('./User');
const transform = require('./transform');

const Conversation = mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false
  },
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
  name: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  participants: [{
    participantType: {
      type: String,
      enum: userTypes,
      required: true
    },
    participantID: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participants.participantType',
      required: true
    }
  }]
}, { timestamps: true });

Conversation.set('toObject', { minimize: false, versionKey: false, virtuals: true, transform });

Conversation.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation'
});

// TODO add hook to prevent duplicate participants

module.exports = mongoose.model('Conversation', Conversation);
