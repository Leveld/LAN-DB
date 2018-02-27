const axios = require('axios');
const mongoose = require('mongoose');
const { apiServerIP } = require('capstone-utils');

const ContentOutlet = mongoose.Schema({
  channelName: {
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
  },
  lastUpdated: {
    type: Date,
    default: () => new Date().toISOString()
  }
}, { timestamps: true });

ContentOutlet.methods.updateInfo = async (doc) => {
  if (doc instanceof mongoose.Model) {
    doc.lastUpdated = new Date().toISOString();
    let tokenInfo = await axios.get(`${apiServerIP}coInfo`, {
      params: {
        id: doc._id
      }
    });

    if (tokenInfo)
      tokenInfo = tokenInfo.data;
    else
      return;

    Object.assign(doc, tokenInfo);
    await doc.save();
  } else if (typeof doc === 'string') {
    const outlet = await ContentOutlet.findOne({ _id: doc })
    if (!outlet)
      return;
    if ((new Date() - outlet.lastUpdated) > (3 * 1000)) {
      await ContentOutlet.methods.updateInfo(outlet);
    }
  }
};

const findOneMiddleware = async function(doc, next) {
  if (!(doc instanceof mongoose.Model))
    next();
  if ((new Date() - doc.lastUpdated) > 21600000) {
    ContentOutlet.methods.updateInfo(doc);
  }
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



module.exports = mongoose.model('ContentOutlet', ContentOutlet);
