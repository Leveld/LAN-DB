const mongoose = require('mongoose');

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

Message.set('toObject', { minimize: false, versionKey: false, virtuals: true });

Message.virtual('readers').get(async function () {
  const conversation = await Conversation.findOne({ _id: this.conversation });
  if (!conversation)
    return [];
  return [{ readerID: conversation.owner.ownerID, readerType: conversation.owner.ownerType }]
    .concat(conversation.participants.map((participant) => ({ readerID: participantID, readerType: participantType })))
    .filter((reader) => !(reader.readerType === this.author.authorType && reader.readerID === this.author.authorID));
});

module.exports = mongoose.model('Message', Message);
