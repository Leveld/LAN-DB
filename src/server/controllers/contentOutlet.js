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

  if(token)
    token = token.data;

  return token ? { accessToken: token.token, refreshToken: token.refreshToken, expires: new Date(token.expires) } :
                 { accessToken: null, refreshToken: null, expires: null};
};

const editOutlet = async (outlet) => {
  if (outlet instanceof Model) {
    const { accessToken } = await getOutletToken(outlet._id);
    return Object.assign({ accessToken }, await outlet.toObject());
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

  const outlet = new ContentOutlet(fields || {});
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

  const outlet = await ContentOutlet.findOne({ _id: id });

  console.log(`outlet: ${outlet.constructor.name}`)

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
  let { id, startDate, endDate } = req.query;

  // if there is no start date or end date, default the end date to be today and the start date to be a week ago.
  if(startDate === undefined || endDate === undefined){
    endDate = new Date();
    startDate = new Date(endDate - 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0];
    endDate = endDate.toISOString().split('T')[0];
  } else {
    startDate = new Date(startDate).toISOString().split('T')[0];
    endDate = new Date(endDate).toISOString().split('T')[0];
  }

  if(startDate > endDate)
    throwError('DBContentOutlet', `startDate must be before endDate`);

  const { accessToken, refreshToken, expires } = await getOutletToken(id);

  if(!accessToken || !refreshToken || !expires)
    throwError('DBContentOutlet', `Could not find tokens for content outlet with id of '${id}'`);

    // call setCredentials on the OAuth2Client object with the token
  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken, expiry_date: expires.valueOf() });
  const youtube = google.youtube({
    version: 'v3'
  });
  const youtubeAnalytics = google.youtubeAnalytics({
    version: 'v1'
  });

  const getYoutubeInfo = () => {
    return new Promise((resolve, reject) => {
      const callback = async (error, response) => {
        try {
          if (error)
            throw error;

          const channelID = response.data.items[0].id;
          const channelLink = `https://www.youtube.com/channel/${channelID}`;
          const profilePicture = response.data.items[0].snippet.thumbnails.default.url;
          const channelName = response.data.items[0].snippet.localized.title;
          const totalViews = response.data.items[0].statistics.viewCount;
          const totalSubscribers = response.data.items[0].statistics.subscriberCount;
          const channelInfo = { channelID, channelLink, profilePicture, channelName, totalViews, totalSubscribers };

          resolve(channelInfo);
        } catch (error) {
          reject(error);
        }
      };

      youtube.channels.list({
        "part": "snippet,statistics",
        "mine": "true"
      }, callback);
    });
  };

  const getYoutubeAnalytics = () => {
    return new Promise((resolve, reject) => {
      const callback = async (error, response) => {
        try {
          if (error)
            throw error;

          const views = response.data.rows[0][0];
          const likes = response.data.rows[0][1];
          const subscribersGained = response.data.rows[0][2];
          const subscribersLost = response.data.rows[0][3];
          const averageViewDuration = response.data.rows[0][4];
          const comments = response.data.rows[0][5];
          const estimatedMinutesWatched = response.data.rows[0][6];
          const dislikes = response.data.rows[0][7];
          const shares = response.data.rows[0][8];
          const analyticsInfo = { views, likes, subscribersGained, subscribersLost,
                                  averageViewDuration, comments, estimatedMinutesWatched,
                                  dislikes, shares };

          resolve(analyticsInfo);
        } catch (error) {
          reject(error);
        }
      };

      const query = {
        'ids': 'channel==mine',
        'start-date': startDate,
        'end-date': endDate,
        'metrics': 'views,likes,subscribersGained,subscribersLost,averageViewDuration,comments,estimatedMinutesWatched,dislikes,shares'
      }
      youtubeAnalytics.reports.query(query, callback);
    });
  }

  const youtubeInfo = await getYoutubeInfo();
  const analytics = await getYoutubeAnalytics();

  const outletInfo = Object.assign({}, youtubeInfo, analytics);
  await res.send(outletInfo);
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
