const Model = require('mongoose').Model;
const { throwError } = require('capstone-utils');

const Contract = require('../models/Contract');

const ERROR_NAME = 'DBContractError';

const editContract = async (contract) => {
  if (contract instanceof Model) {
    return Object.assign({ }, contract.toObject());
  }
  return contract;
};

// GET /contract
const getContract = async (req, res, next) => {
  const { id } = req.query;

  if (typeof id !== 'string')
    throwError(ERROR_NAME, 'Must provide an id' );

  const contract = await Contract.findOne({ _id: id });
  if (!contract)
    throwError(ERROR_NAME, `Could not find contract with id '${id}'` );

  await res.send(await editContract(contract));
};

// POST /contract
const createContract = async (req, res, next) => {
  const { fields } = req.body;

  if (typeof fields !== 'object' || fields === null)
    throwError(ERROR_NAME, 'Must provide fields' );

  const newContract = new Contract(fields);

  await newContract.save();

  await res.send(await editContract(newContract));
};

// PATCH /contract
const updateContract = async (req, res, next) => {
  const { id, fields } = req.body;

  if (typeof id !== 'string' || typeof fields !== 'object' || fields === null)
    throwError(ERROR_NAME, 'Must provide an id and fields');

  const contract = await Contract.findOne({ _id: id });
  if (!contract)
    throwError(ERROR_NAME, `Could not find Contract with id '${id}'`);

  Object.entries(fields).forEach(([key, value]) => {
    contract[key] = value;
  });

  await contract.save();

  await res.send(await editContract(contract));
};

module.exports = {
  getContract,
  createContract,
  updateContract
};
