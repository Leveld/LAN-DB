const axios = require('axios');
const Model = require('mongoose').Model;
const { throwError } = require('capstone-utils');

const User = require('../models/User');
const ContentProducer = require('../models/ContentProducer');
const Business = require('../models/Business');
const Manager = require('../models/Manager');
const Campaign = require('../models/Campaign');
const Contract = require('../models/Contract');

const editCampaign = async (campaign) => {
  if (campaign instanceof Model) {

    return Object.assign({ }, contract.toObject());
  }
  return campaign;
};

// GET /campaign
const getCampaign = async (req, res, next) => {

};

// POST /campaign
const createCampaign = async (req, res, next) => {

};

// PATCH /campaign
const updateCampaign = async (req, res, next) => {

};

// GET /campaigns
const getCampaigns = async (req, res, next) => {

};

module.exports = {
  getCampaign,
  createCampaign,
  updateCampaign,
  getCampaigns
};
