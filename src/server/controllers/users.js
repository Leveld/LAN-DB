const axios = require('axios');
const Model = require('mongoose').Model;
const { dbServerIP, throwError, USER_ERROR, defaultUserPicture, defaultBAPicture, defaultCPPicture, defaultMAPicture, mapAsync } = require('capstone-utils');

const User = require('../models/User');
const ContentProducer = require('../models/ContentProducer');
const Business = require('../models/Business');
const Manager = require('../models/Manager');

const error = (message, status = USER_ERROR) => throwError('DBUserError', message, status);

const checkContact = (contact = null) => {
  if (contact === null)
    return;
  const validProperties = [
    'email', 'phoneNumber', 'facebook',
    'twitter', 'linkedIn', 'googlePlus'
  ];

  if (typeof contact === 'object' && !Array.isArray(contact)) {
    for (let [key, value] of Object.entries(contact)) {
      if (validProperties.indexOf(key) < 0)
        error(`Unable to process parameter 'contact'. Received invalid property '${key}'. Received: ${contact}`);
      if (value === null)
        settings[key] = value = '';
      if (typeof value !== 'string')
        error(`All properties of parameter 'contact' must be a String! Received: ${contact}`);

    }
  } else {
    error(`Parameter 'contact' must be a key-value Object. Received: ${contact}`);
  }

};

const checkSettings = (settings = null) => {
  if (settings === null)
    return;
  const validProperties = [
    'showEmail', 'showContactEmail', 'showAge',
    'showGender', 'showPhoneNumber', 'showFacebook',
    'showTwitter', 'showLinkedIn', 'showGooglePlus'
  ];

  if (typeof settings === 'object' && !Array.isArray(settings)) {
    for ([key, value] of Object.entries(settings)) {
      if (validProperties.indexOf(key) < 0)
        error(`Unable to process parameter 'settings'. Received invalid property '${key}'. Received: ${settings}`);
      if (value === null)
        settings[key] = value = false;
      if (typeof value !== 'boolean')
        error(`All properties of parameter 'settings' must be a Boolean! Received: ${settings}`);
    }
  } else {
    error(`Parameter 'settings' must be a key-value Object. Received: ${settings}`);
  }

};

const getUserFromEmailOrID = async (email, id, type) => {
  if (!email && !id)
    error(`You must provide either an 'email' or 'id'.`);

  if (typeof type === 'string') {

    let accountType;

    switch (type.toLowerCase()) {
      case 'user':
        accountType = User;
        break;
      case 'contentproducer':
        accountType = ContentProducer;
        break;
      case 'business':
        accountType = Business;
        break;
      case 'manager':
        accountType = Manager;
        break;
      default:
        error(`Unknown 'type'. Received: ${type}`);
    }

    const user = await accountType.findOne(id ? { _id: id } : { email });

    return user;
  } else {

    if (id)
      error(`Missing parameter 'type'.`);

    let user;
    let types = [
      'user', 'contentproducer',
      'business', 'manager'
    ];

    for (let t of types) {
      try {
        user = await getUserFromEmailOrID(email, null, t);
        if (user)
          return user;
      } catch (error) {
        continue;
      }
    }
  }
};

const editUser = async (user) => {
  if (user instanceof Model) {
    const type = user.constructor.modelName;
    let profilePicture = '';
    if (type === 'ContentProducer') {
      profilePicture = defaultCPPicture;
      await user.populate('contentOutlets').execPopulate();
    } else if (type === 'Business') {
      profilePicture = defaultBAPicture;
    } else if (type === 'Manager') {
      profilePicture = defaultMAPicture;
    } else {
      profilePicture = defaultUserPicture;
    }
    if (typeof user.profilePicture !== 'string' || user.profilePicture === "")
      user.profilePicture = profilePicture;
    return Object.assign({ type }, await user.toObject());
  }
  return user;
};

// POST /user
const createUser = async (req, res, next) => {
  const { email, fields = {} } = req.body;
  if (fields.contact === null)
    fields.contact = undefined;
  if (fields.settings === null)
    fields.settings = undefined;

  const missing = [];
  if (email == null)
    missing.push('email');
  if (fields.name == null)
    missing.push('fields.name');
  if (fields.auth0ID == null)
    missing.push('fields.auth0ID');
  if (fields.createdAt == null)
    missing.push('fields.createdAt');
  if (missing.length > 0)
    error(`Request did not contain all required parameters. Missing: ${missing}`);

  checkContact(fields.contact);
  checkSettings(fields.settings);

  let user = await axios.get(`${dbServerIP}user?email=${email}`);
  if (user && typeof user.data !== 'string')
    return error(`User with email '${email}' already exists!`);

  user = new User({
    email,
    ...fields
  });

  const newUser = await user.save();
  return await res.send(await editUser(newUser));


};

// PUT /user
const convertToOtherUserType = async (req, res, next) => {
  const { email, type, fields = {} } = req.body;

  const missing = [];
  if (email == null)
    missing.push('email');
  if (type == null)
    missing.push('type');
  if (missing.length > 0)
    error(`Request did not contain all required parameters. Missing: ${missing}`);

  if (typeof type !== 'string')
    error(`Parameter 'type' must be a String! Received: ${type}`);

  checkContact(fields.contact);
  checkSettings(fields.settings);

  let accountType;

  switch (type.toLowerCase()) {
    case 'contentproducer':
      accountType = ContentProducer;
      break;
    case 'business':
      accountType = Business;
      break;
    case 'manager':
      accountType = Manager;
      break;
    default:
      error(`Unknown 'type'. Received: ${type}`);
  }

  const user = await User.findOne({ email });
  if (!user)
    error(`User with email '${email}' not found. This call can only be used to convert a User to another type.`);

  const userFields = user.toObject({ depopulate: true });
  delete userFields._id;
  Object.assign(userFields, fields);

  const newAccount = new accountType(userFields);
  const convertedAccount = await newAccount.save();
  if (convertedAccount)
    await user.remove();

  await res.send(await editUser(convertedAccount));
};

// GET /user
const getUser = async (req, res, next) => {
  const { email, id, type } = req.query;

  const user = await getUserFromEmailOrID(email, id, type);
  await res.send(await editUser(user));
};

// PATCH /user
const updateUser = async (req, res, next) => {
  const { email, id, type, fields } = req.query;

  const user = await getUserFromEmailOrID(email, id, type);
  if (!user)
    error(`User not found. Received: ${JSON.stringify(req.query)}`);

  for (let [key, value] of fields)
    user[key] = value;

  await user.save();

  await res.send(await editUser(user));
};

// PATCH /user/co
const addContentOutlet = async (req, res, next) => {
  const { email, id, type, contentOutlet } = req.body;

  const user = await getUserFromEmailOrID(email, id, type);
  if (!user)
    error(`User not found. Received: ${JSON.stringify(req.query)}`);

  await axios.get(`${dbServerIP}outlet`, {
    params: {
      id: contentOutlet
    }
  });

  if (!user.contentOutlets.includes(contentOutlet))
    user.contentOutlets.push(contentOutlet);

  await user.save();

  await res.send(await editUser(user));
}

// GET /users
const getUsers = async (req, res, next) => {
  let { type = 'all' } = req.query;

  if (typeof type === 'string')
    type = type.toLowerCase();

  const findUsers = async (type) => {
    let users = [];

    switch (type) {
      case 'contentproducer':
        users = await ContentProducer.find() || [];
        break;
      case 'manager':
        users = await Manager.find() || [];
        break;
      case 'business':
        users = await Business.find() || [];
        break;
      default:
        break;
    }

    return await mapAsync(users, editUser);
  };

  try {
    switch (type) {
      case 'contentproducer':
        return await res.send([].concat(await findUsers('contentproducer')));
      case 'advertiser':
        return await res.send([].concat(await findUsers('business'), await findUsers('manager')));
      case 'manager':
        return await res.send([].concat(await findUsers('manager')));
      case 'business':
        return await res.send([].concat(await findUsers('business')));
      case 'all':
      default:
        return await res.send([].concat(await findUsers('contentproducer'), await findUsers('manager'), await findUsers('business')));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  convertToOtherUserType,
  getUser,
  updateUser,
  addContentOutlet,
  getUsers
};
