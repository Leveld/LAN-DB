const Model = require('mongoose').Model;
const { throwError, mapAsync } = require('capstone-utils');

const { Campaign, Contract } = require('../models');

const ERROR_NAME = 'DBCampaignError';

const editCampaign = async (campaign) => {
  if (campaign instanceof Model) {
    return Object.assign({ }, campaign.toObject());
  }
  return campaign;
};

// GET /campaign
const getCampaign = async (req, res, next) => {
  const { id } = req.query;

  if (typeof id !== 'string')
    throwError(ERROR_NAME, 'Must provide an id' );

  const campaign = await Campaign.findOne({ _id: id });
  if (!campaign)
    throwError(ERROR_NAME, 'Could not find campaign' );

  return await res.send(campaign.toObject());
};

// POST /campaign
const createCampaign = async (req, res, next) => {
  const { fields } = req.body;

  if (typeof fields !== 'object' || fields === null)
    throwError(ERROR_NAME, 'Must provide fields' );

  const newCampaign = new Campaign(fields);

  await newCampaign.save();

  await res.send(await editCampaign(newCampaign));
};

// PATCH /campaign
const updateCampaign = async (req, res, next) => {
  const { id, fields } = req.body;

  if (typeof id !== 'string' || typeof fields !== 'object' || fields === null)
    throwError(ERROR_NAME, 'Must provide an id and fields' );

  const campaign = await Campaign.findOne({ _id: id });

  if (!campaign)
    throwError(ERROR_NAME, `No Campaign found with id '${id}'`);

  Object.entries(fields).forEach(([key, value]) => {
    campaign[key] = value;
  });

  await campaign.save();

  await res.send(await editCampaign(campaign));
};

// PATCH /campaign/contract
const addContract = async (req, res, next) => {
  const { id, contractID } = req.body;

  if(typeof id !== 'string' || typeof contractID !== 'string')
    throwError(ERROR_NAME, 'Must provide an id and contractID' );

  const campaign = await Campaign.findOne({ _id: id });
  if(!campaign)
    throwError(ERROR_NAME, `Could not find contract with id ${id}`);

  const contract = await Contract.findOne({ _id: contractID });
  if(!contract)
    throwError(ERROR_NAME, `Could not find contract with id ${contractId}`);

  if(!campaign.contracts.includes(contractID))
    campaign.contracts.push(contractID);

  await campaign.save();

  await res.send(campaign.toObject());
};

// GET /campaigns
const getCampaigns = async (req, res, next) => await res.send(await mapAsync(await Campaign.find(), editCampaign));

module.exports = {
  getCampaign,
  createCampaign,
  updateCampaign,
  addContract,
  getCampaigns
};
