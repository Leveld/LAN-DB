const mongoose = require('mongoose');
const { userTypes } = require('./User');
const transform = require('./transform');

const Message = mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  messageType: {
    type: String,
    enum: ['Chat', 'Payment', 'Contract', 'File'],
    required: true
  },
  author: {
    authorType: {
      type: String,
      enum: userTypes,
      required: true
    },
    authorID: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'author.authorType',
      required: true
    }
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

Message.set('toObject', { minimize: false, versionKey: false, virtuals: true, transform });
Message.set('toJSON', { minimize: false, versionKey: false, virtuals: true, transform });

Message.virtual('readers').get(async function () {
  const Conversation = require('./Conversation'); // has to be required here
  const conversation = await Conversation.findOne({ _id: this.conversation });
  if (!conversation)
    return [];
  return [{ readerID: conversation.owner.ownerID, readerType: conversation.owner.ownerType }]
    .concat(conversation.participants.map(({ participantID, participantType }) => ({ readerID: participantID, readerType: participantType })))
    .filter((reader) => !(reader.readerType.toLowerCase() === this.author.authorType.toLowerCase() && `${reader.readerID}` === `${this.author.authorID}`));
});

module.exports = mongoose.model('Message', Message);
