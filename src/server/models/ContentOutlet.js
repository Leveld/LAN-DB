const axios = require('axios');
const mongoose = require('mongoose');
const { dbServerIP, IS_DEVELOPMENT } = require('capstone-utils');
const { userTypes } = require('./User');
const transform = require('./transform');

const ContentOutlet = mongoose.Schema({
  channelName: {
    type: String,
  },
  channelID: {
    type: String,
  },
  profilePicture: String,
  channelLink: {
    type: String,
  },
  totalViews: Number,
  totalSubscribers: Number,
  views: Number,
  likes: Number,
  subscribersGained: Number,
  subscribersLost: Number,
  averageViewDuration: Number,
  comments: Number,
  estimatedMinutesWatched: Number,
  dislikes: Number,
  shares: Number,
  owner: {
    ownerType: {
      type: String,
      enum: userTypes,
      required: true
    },
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'owner.ownerType',
    }
  },
  lastUpdated: {
    type: Date,
    default: () => new Date().toISOString()
  }
}, { timestamps: true });

ContentOutlet.methods.timeSinceUpdated = function() {
  return new Date() - this.lastUpdated;
}

ContentOutlet.methods.updateInfo = async function (...args) {
  const doc = args.length ? args[0] : this;
  if (doc instanceof mongoose.Model) {
    let tokenInfo = await axios.get(`${dbServerIP}coInfo`, {
      params: {
        id: doc._id
      }
    });
    if (tokenInfo)
      tokenInfo = tokenInfo.data;
    else
      return;
    doc.lastUpdated = new Date().toISOString();
    Object.assign(doc, tokenInfo);
    await doc.save();
  } else if (typeof doc === 'string') {
    const outlet = await ContentOutlet.findOne({ _id: doc })
    if (!outlet)
      return;
    if (doc.timeSinceUpdated() > (3 * 1000)) {
      await outlet.updateInfo();
    }
  }
}

const findOneMiddleware = async function(doc, next) {
  const refreshDelay = IS_DEVELOPMENT ? 5000 : 21600000;
  if (!(doc instanceof mongoose.Model))
    next();
  if (doc.timeSinceUpdated() > refreshDelay)
    await doc.updateInfo();
};

ContentOutlet.post('find', async function(docs, next) {
  if (!Array.isArray(docs))
    next();
  for (let doc of docs) {
    await findOneMiddleware(doc, () => undefined);
  }
  next();
});

ContentOutlet.post('findOne', findOneMiddleware);

ContentOutlet.set('toObject', { minimize: false, versionKey: false, virtuals: true, transform });

module.exports = mongoose.model('ContentOutlet', ContentOutlet);
