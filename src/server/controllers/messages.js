const Model = require('mongoose').Model;
const { throwError, mapAsync } = require('capstone-utils');

const { Conversation, Message } = require('../models');
const { getAssociatedConversations } = require('./conversations');

const ERROR_NAME = 'DBMessageError';

const editMessage = async (message) => {
  if (message instanceof Model) {
    return Object.assign({ }, await message.toObject());
  }
  return message;
};

// GET /message
const getMessage = async (req, res, next) => {
  const { id } = req.query;

  if (typeof id !== 'string')
    throwError(ERROR_NAME, `Expected 'id' to be a String. Received: ${id}`);

  const message = await Message.findOne({ _id: id });
  if (!message)
    throwError(ERROR_NAME, `Could not find Message by id '${id}'`);

  await res.send(await editMessage(message));
};

// POST /message
const createMessage = async (req, res, next) => {
  const { fields } = req.body;
  const { authorID, authorType } = fields.author;

  if (typeof fields !== 'object' || fields === null)
    throwError(ERROR_NAME, 'Must provide fields' );

  const conversation = (await getAssociatedConversations(authorID, authorType)).find((conversation) => `${conversation._id}` === `${fields.conversation}`);
  if (!conversation)
    throwError(ERROR_NAME, `Could not find conversation with id '${fields.conversation}' that user ${JSON.stringify(fields.author)} is allowed to post in.`)

  const newMessage = new Message(fields);

  await newMessage.save();

  await res.send(await editMessage(newMessage));
};

// PATCH /message
const updateMessage = async (req, res, next) => {
  const { id, fields } = req.body;

  if (typeof id !== 'string' || typeof fields !== 'object' || fields === null)
    throwError(ERROR_NAME, 'Must provide an id and fields' );

  const message = await Message.findOne({ _id: id });

  if (!message)
    throwError(ERROR_NAME, `No Message found with id '${id}'`);

  if (!fields.author ||
    !(`${fields.author.authorID}` === `${message.author.authorID}` && fields.author.authorType.toLowerCase() === message.author.authorType.toLowerCase()))
    throwError(ERROR_NAME, `Author does not have permission to modify Message.`);

  Object.entries(fields).forEach(([key, value]) => {
    message[key] = value;
  });

  await message.save();

  await res.send(await editMessage(message));
};

// GET /messages
const getMessages = async (req, res, next) => {
  const { authorID, authorType } = req.query;

  if (typeof authorID !== 'string')
    throwError(ERROR_NAME, `Expected authorID to be a String. Received: ${authorID}`);
  if (typeof authorType !== 'string')
    throwError(ERROR_NAME, `Expected authorType to be a String. Received: ${authorType}`);

  const messages = await Message.find({ 'author.authorType': authorType, 'author.authorID': authorID }) || [];
  await res.send(await mapAsync(messages, editMessage));
};

module.exports = {
  getMessage,
  createMessage,
  updateMessage,
  getMessages
};
