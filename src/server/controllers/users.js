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
    for ([key, value] of Object.entries(contact)) {
      if (validProperties.indexOf(key) < 0)
        error(`Unable to process parameter 'contact'. Received invalid property '${key}'. Received: ${contact}`);
      if (value === null)
        settings[key] = value = '';
      if (typeof value !== 'string')
        error(`All properties of paramater 'contact' must be a String! Received: ${contact}`);

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
        error(`All properties of paramater 'settings' must be a Boolean! Received: ${settings}`);
    }
  } else {
    error(`Parameter 'settings' must be a key-value Object. Received: ${settings}`);
  }

};

// this is used to create a User.
const create = async (req, res, next) => {
  const { email, fields } = req.body;
  if (contact === null)
    contact = undefined;
  if (settings === null)
    settings = undefined;

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

  const user = new User({
    email,
    ...fields
  })

  const newUser = await user.save();
  res.send(newUser);
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

  res.send(convertedAccount);
}

module.exports = { create, convertToOtherUserType };
