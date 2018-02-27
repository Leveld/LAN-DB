const axios = require('axios');
const Model = require('mongoose').Model;
const { throwError } = require('capstone-utils');

const User = require('../models/User');
const ContentProducer = require('../models/ContentProducer');
const Business = require('../models/Business');
const Manager = require('../models/Manager');
const Campaign = require('../models/Campaign');
const Contract = require('../models/Contract');

const editContract = async (contract) => {
  if (contract instanceof Model) {

    return Object.assign({ }, contract.toObject());
  }
  return contract;
};

// GET /contract
const getContract = async (req, res, next) => {

};

// POST /contract
const createContract = async (req, res, next) => {

};

// PATCH /contract
const updateContract = async (req, res, next) => {

};

module.exports = {
  getContract,
  createContract,
  updateContract
};
