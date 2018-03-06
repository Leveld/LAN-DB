const mongoose = require('mongoose');
const { forEachAsync } = require('capstone-utils');
const Message = require('./Message');

const Conversation = mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false
  },
  owner: {
    ownerType: {
      type: String,
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
      required: true
    },
    participantID: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participants.participantType',
      required: true
    }
  }]
}, { timestamps: true });

Conversation.set('toObject', { minimize: false, versionKey: false, virtuals: true });

Conversation.virtual('messages').get(async function () {
  const messages = await Message.find({ conversation: this._id }) || [];
  messages.sort((a, b) => {
    if (a.createdAt < b.createdAt)
      return -1;
    if (a.createdAt > b.createdAt)
      return 1;
    return 0;
  });
  return messages;
});

// TODO add hook to prevent duplicate participants

module.exports = mongoose.model('Conversation', Conversation);
