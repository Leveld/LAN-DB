const mongoose = require('mongoose');

const ContentOutlet = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  channelID: {
    type: String,
    required: true
  },
  profilePicture: String,
  channelLink: {
    type: String,
    required: true
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
  }
});

module.exports = mongoose.model('ContentOutlet', ContentOutlet);
