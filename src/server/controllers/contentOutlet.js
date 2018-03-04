const axios = require('axios');
const base64 = require('base64-url');
const { throwError, authServerIP, dbServerIP, googleRedirect, mapAsync } = require('capstone-utils');
const { google } = require('googleapis');
const plus = google.plus('v1');
const OAuth2Client = google.auth.OAuth2;
const {googleClientID, googleClientSecret} = require('../secret.json');
const Model = require('mongoose').Model;

const { ContentOutlet } = require('../models');

const oauth2Client = new OAuth2Client(
  googleClientID,
  googleClientSecret,
  googleRedirect
);

google.options({ auth: oauth2Client });

const getOutletToken = async (contentOutlet) => {
  let token = false;

  try {
    token = await axios.get(`${authServerIP}cotoken`, {
      params: {
        contentOutlet
      }
    });
  } catch (error) {}

  return token ? { accessToken: token.token, refreshToken: token.refreshToken, expires: new Date(token.expires) } :
                 { accessToken: null, refreshToken: null, expires: null};
};

const editOutlet = async (outlet) => {
  if (outlet instanceof Model) {
    const { accessToken } = await getOutletToken(outlet._id);
    return Object.assign({ accessToken }, outlet.toObject());
  }
  return outlet;
};

// GET /outlet
const getOutlet = async (req, res, next) => {
  const { id } = req.query;
  const outlet = await ContentOutlet.findOne({ _id: id });
  if(!outlet)
    throwError('DBContentOutlet', 'Could not find content outlet' );

  await res.send(await editOutlet(outlet));
}

// POST /outlet
const createOutlet = async (req, res, next) => {
  const { fields } = req.body;

  if (typeof fields !== 'object')
    throwError('DBContentOutlet', `Missing parameter 'fields'`);

  const outlet = new ContentOutlet(fields);
  const newOutlet = await outlet.save();
  await res.send(await editOutlet(newOutlet));
}

// PATCH /outlet
const updateOutlet = async (req, res, next) => {
  const { id, fields } = req.body;

  if (typeof id !== 'string')
    throwError('DBContentOutlet', `Missing parameter 'id'`);
  if (typeof fields !== 'object')
    throwError('DBContentOutlet', `Missing parameter 'fields'`);

  const outlet = ContentOutlet.findOne({ _id: id });

  if (!outlet)
    throwError('DBContentOutlet', `Could not find content outlet '${id}'`);

  for (let [key, value] of Object.entries(fields)) {
    outlet[key] = value;
  }

  await outlet.save();

  await res.send(await editOutlet(outlet));
}

// GET /coInfo
const getContentOutletInfo = async (req, res, next) => {
  // call getOutletToken to get access token
  const { id } = req.query;
  const { accessToken, refreshToken, expires } = await getOutletToken(id);
  if(!accessToken || !refreshToken || !expires)
    throwError('DBContentOutlet', `Could not find tokens for content outlet with id of '${id}'`);

    // call setCredentials on the OAuth2Client object with the token
  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken, expiry_date: expires.valueOf() });
  const youtube = google.youtube({
    version: 'v3'
  });

  const callback = async (error, response) => {
    try {
      if (error)
        throw error;

      const channelID = response.data.items[0].id;
      const channelLink = `https://www.youtube.com/channel/${channelID}`;
      const profilePicture = response.data.items[0].snippet.thumbnails.default.url;
      const channelName = response.data.items[0].snippet.localized.title;
      const channelInfo = { channelID, channelLink, profilePicture, channelName };

      await res.send(channelInfo);
    } catch (error) {
      next(error);
    }
  };

  youtube.channels.list({
    "part": "snippet",
    "mine": "true"
  }, callback);
}

// GET /outlets
const getOutlets = async (req, res, next) => await res.send(await mapAsync(await ContentOutlet.find(), editOutlet));

module.exports = {
  getOutlet,
  createOutlet,
  updateOutlet,
  getOutlets,
  getContentOutletInfo
};
