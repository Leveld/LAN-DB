const Model = require('mongoose').Model;
const { throwError, mapAsync } = require('capstone-utils');

const { Conversation } = require('../models');

const ERROR_NAME = 'DBConversationError';

const editConversation = async (conversation) => {
  if (conversation instanceof Model) {
    return Object.assign({ }, conversation.toObject());
  }
  return conversation;
};

// GET /conversation
const getConversation = async (req, res, next) => {
  const { id } = req.query;

  if (typeof id !== 'string')
    throwError(ERROR_NAME, 'Must provide an id' );

  const conversation = await Conversation.findOne({ _id: id });
  if (!conversation)
    throwError(ERROR_NAME, `Could not find Conversation with id '${id}'` );

  await res.send(await editConversation(conversation));
};

// POST /conversation
const createConversation = async (req, res, next) => {
  const { ownerID, ownerType, participants, name, description } = req.body;

  if (typeof ownerID !== 'string')
    throwError(ERROR_NAME, `Expected ownerID to be a String. Received: ${ownerID}`);
  if (typeof ownerType !== 'string')
    throwError(ERROR_NAME, `Expected ownerType to be a String. Received: ${ownerType}`);
  if (!Array.isArray(participants) || participants.length < 1)
    throwError(ERROR_NAME, `Expected participants to be an Array of at least one participant. Received: ${participants}`);

  if (name !== undefined && name !== null && typeof name !== 'string')
    throwError(ERROR_NAME, `Expected name to be a String. Received: ${name}`);
  else
    name = null;

  if (description !== undefined && description !== null && typeof description !== 'string')
    throwError(ERROR_NAME, `Expected description to be a String. Received: ${description}`);
  else
    description = null;

  for (let participant of participants) {
    if (typeof participant !== 'object' || participant === null || typeof participant.participantID !== 'string')
      throwError(ERROR_NAME, `Expected each participants.participantID to be a String. Received: ${participants}`);
    if (typeof participant !== 'object' || participant === null || typeof participant.participantType !== 'string')
      throwError(ERROR_NAME, `Expected each participants.participantType to be a String. Received: ${participants}`);
  }

  const existingConversation = await Conversation.find({ 'owner.ownerID': ownerID, 'owner.ownerType': ownerType, participants });
  if (existingConversation)
    return await res.send(await editConversation(existingConversation));

  const newConversation = new Conversation({
    isGroup: participants.length > 1,
    owner: { ownerID, ownerType },
    name, description,
    participants
  });

  if (!newConversation)
    throwError(ERROR_NAME, `Unable to create Conversation. Received: ${req.body}`);

  await res.send(await editConversation(newConversation));
};

// PATCH /conversation
const updateConversation = async (req, res, next) => {
  const { id, fields } = req.body;

  if (typeof id !== 'string' || typeof fields !== 'object' || fields === null)
    throwError(ERROR_NAME, 'Must provide an id and fields' );

  const conversation = await Conversation.findOne({ _id: id });

  if (!conversation)
    throwError(ERROR_NAME, `No Conversation found with id '${id}'`);

  Object.entries(fields).forEach(([key, value]) => {
    conversation[key] = value;
  });

  await conversation.save();

  await res.send(await editConversation(conversation));
};

// GET /conversations
const getConversations = async (req, res, next) => {
  const { userID, userType } = req.query;
  const conversations = await Conversation.find({
    $or: [ // conversations where user is either owner of conversation or participant
      { 'owner.ownerType': userType, 'owner.ownerID': userID },
      { 'participants.participantType': userType, 'participants.participantID': userID }
    ]
  }) || [];

  await res.send(await mapAsync(conversations, editConversation));
};

module.exports = {
  getConversation,
  createConversation,
  updateConversation,
  getConversations
};
