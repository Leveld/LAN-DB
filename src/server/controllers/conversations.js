const Model = require('mongoose').Model;
const { throwError, mapAsync } = require('capstone-utils');

const { Conversation } = require('../models');

const ERROR_NAME = 'DBConversationError';

const editConversation = async (conversation) => {
  if (conversation instanceof Model) {
    conversation = await conversation.populate('messages').execPopulate();
    return Object.assign({ }, await conversation.toObject());
  }
  return conversation;
};

// returns an array of all conversations where the user is either
// the owner or a participant
const getAssociatedConversations = async (userID, userType) => {
  return await Conversation.find({
    $or: [ // conversations where user is either owner of conversation or participant
      { 'owner.ownerType': userType, 'owner.ownerID': userID },
      { 'participants.participantType': userType, 'participants.participantID': userID }
    ]
  }) || [];
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

const zip = (...items) => {
  const zip = [];
  let arrcount = 0;
  items.forEach((item) => item.length > arrcount ? arrcount=item.length : null);
  for(let i = 0; i < arrcount; i++){
    const arrItem = new Array(items.length);
    zip.push(arrItem);
  }
  for(let i = 0; i < items.length; i++){
    for(let j = 0; j < arrcount; j++){
      zip[j][i] = items[i][j];
    }
  }
  return zip;
}

// POST /conversation
const createConversation = async (req, res, next) => {
  const { ownerID, ownerType, participants } = req.body;
  let { name, description } = req.body;

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

  const compareIDs = (id1, id2) => `${id1}` === `${id2}`;
  const compareTypes = (type1, type2) => type1.toLowerCase() === type2.toLowerCase();

  const participantSort = (p1, p2) => {
    const { participantID : p1ID, participantType: p1Type } = p1;
    const { participantID : p2ID, participantType: p2Type } = p2;
    if (`${p1ID}` < `${p2ID}`)
      return -1;
    if (`${p1ID}` > `${p2ID}`)
      return 1;
    if (p1Type.toLowerCase() < p2Type.toLowerCase())
      return -1;
    if (p1Type.toLowerCase() > p2Type.toLowerCase())
      return 1;
    return 0;
  };

  // creates a function that will compare participants
  // with the ownerID and ownerType it was created with
  // can set flip to true to look for things other the owner
  const compareOwnerAndParticipant = (ownerID, ownerType, flip = false) => {
    flip = flip === true; // make sure it's a boolean
    return ({ participantID : pID, participantType : pType }) => {
      const areEqual = compareIDs(ownerID, pID) && compareTypes(ownerType, pType);
      return flip ? !areEqual : areEqual;
    };
  };

  // compare that two participant arrays are the same
  const checkPartsAreSame = (participants1, participants2) => {
    // verify that both participant arrays are actually arrays
    if (!Array.isArray(participants1) || !Array.isArray(participants2))
      return false;
    // verify that the number of participants in each array is the same
    if (participants1.length !== participants2.length)
      return false;
    participants1.sort(participantSort);
    participants2.sort(participantSort);
    for (let [part1, part2] of zip(participants1, participants2)) {
      const { participantID : p1ID, participantType : p1Type } = part1;
      const { participantID : p2ID, participantType : p2Type } = part2;
      // each participant from the req.body/conversation should have the same id and type
      if (!compareIDs(p1ID, p2ID) || !compareTypes(p1Type, p2Type))
        return false;
    }
    return true;
  };

  for (let participant of participants) {
    if (typeof participant !== 'object' || participant === null || typeof participant.participantID !== 'string')
      throwError(ERROR_NAME, `Expected each participants.participantID to be a String. Received: ${JSON.stringify(participants)}`);
    if (typeof participant !== 'object' || participant === null || typeof participant.participantType !== 'string')
      throwError(ERROR_NAME, `Expected each participants.participantType to be a String. Received: ${JSON.stringify(participants)}`);
    const compare = compareOwnerAndParticipant(ownerID, ownerType);
    if (compare(participant))
      throwError(ERROR_NAME, `The owner of a conversation can't also be a participant!`)
  }

  const conversations = (await getAssociatedConversations(ownerID, ownerType)).filter((conversation) => {
    const { owner : { ownerID : oID, ownerType : oType }, participants : parts = [] } = conversation;

    // check if owners are the same
    if (`${oID}` === `${ownerID}` && oType.toLowerCase() === ownerType.toLowerCase())
      // owners are the same so only need to verify that participants are the same
      return checkPartsAreSame(participants, parts);

    // owners of the conversations weren't the same so
    // check if the owner from req.body is in the participants in conversation
    const ps = parts.find(compareOwnerAndParticipant(ownerID, ownerType));
    if (!ps) // owner wasn't in the participants
      return false;

    // check if owner of conversation is in req.body participants
    const os = participants.find(compareOwnerAndParticipant(oID, oType));
    if (!os) // owner wasn't in the participants
      return false;

    // now I know that owner from req.body is in conversation participants
    // and that the owner of conversation is in req.body participants
    // remove the owner of conversation from req.body participants
    const modifiedParticipants = participants.filter(compareOwnerAndParticipant(oID, oType, true));
    // put the owner from req.body into req.body participants
    modifiedParticipants.push({ participantID: ownerID, participantType: ownerType });
    // recheck if the two participant arrays match now
    return checkPartsAreSame(modifiedParticipants, parts);
  });

  if (conversations.length > 0) {
    if (conversations.length > 1)
      throwError(ERROR_NAME, `Somehow there were ${conversations.length} matching conversations...` +
        `Received: "${JSON.stringify(req.body, null, 2)}" and found "${JSON.stringify(conversations, null, 2)}"`);
    return await res.send(await editConversation(conversations[0]));
  }

  const newConversation = new Conversation({
    isGroup: participants.length > 1,
    owner: { ownerID, ownerType },
    name, description,
    participants
  });

  if (!newConversation)
    throwError(ERROR_NAME, `Unable to create Conversation. Received: ${req.body}`);

  await newConversation.save();

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

  if (typeof userID !== 'string')
    throwError(ERROR_NAME, `Expected userID to be a String. Received: ${userID}`);
  if (typeof userType !== 'string')
    throwError(ERROR_NAME, `Expected userType to be a String. Received: ${userType}`);


  await res.send(await mapAsync(await getAssociatedConversations(userID, userType), editConversation));
};

module.exports = {
  getConversation,
  createConversation,
  updateConversation,
  getConversations
};
