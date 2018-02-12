const axios = require('axios');
const Model = require('mongoose').Model;
const { dbServerIP } = require('capstone-utils');

const User = require('../models/User');
const ContentProducer = require('../models/ContentProducer');
const Business = require('../models/Business');
const Manager = require('../models/Manager');

const error = (message) => {
  const e = new Error(message);
  e.name = 'CreateUserError';
  throw e;
};

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

// this is used to create a User.
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

  try {
    const user = await axios.get(`${dbServerIP}user?email=${email}`);
  } catch (error) {
    const user = new User({
      email,
      ...fields
    })

    const newUser = await user.save();
    return await res.send(newUser.toObject());
  }

  error(`User with email '${email}' already exists!`);
};

// this is used to convert a User to a ContentProducer, Business, or Manager.
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

  await res.send(convertedAccount.toObject());
};

const getUser = async (req, res, next) => {
  const { email, id, type } = req.query;

  if (!email && !id)
    error(`You must provide either an 'email' or 'id'.`);

  const editUser = (user) => {
    if (user instanceof Model)
      return Object.assign({ type: user.constructor.modelName }, user.toObject());
    return user;
  }

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
    if (!user)
      error(`User not found. Received: ${JSON.stringify(req.query)}`);
    await res.send(editUser(user));

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
        user = await axios.get(`${dbServerIP}user?email=${email}&type=${t}`);
        if (user)
          user = user.data;
        return await res.send(user);
      } catch (error) {
        continue;
      }
    }
    error(`User not found. Received: ${JSON.stringify(req.query)}`);
  }

  const updateUser = async (req, res, next) => {

  };

};

module.exports = {
  createUser,
  convertToOtherUserType,
  getUser
};
