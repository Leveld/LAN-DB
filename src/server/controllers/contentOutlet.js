const axios = require('axios');
const { throwError, authServerIP } = require('capstone-utils');

const { ContentOutlet } = require('../models');

// GET /outlet
const getOutlet = async (req, res, next) => {
  const { id } = req.query;
  const outlet = await ContentOutlet.findOne({ _id: id });
  if(!outlet)
    throwError('DBContentOutlet', 'Could not find content outlet' );

  return await res.send(outlet.toObject());
}

// POST /outlet
const createOutlet = async (req, res, next) => {
  const { fields } = req.body;

  if (typeof fields !== 'object')
    throwError('DBContentOutlet', `Missing parameter 'fields'`);

  const outlet = new ContentOutlet(fields);
  const newOutlet = await outlet.save();
  return await res.send(newOutlet.toObject());
}

// PATCH /outlet
const updateOutlet = async (req, res, next) => {
  const { id, fields } = req.body;

  if (typeof id !== 'string')
    throwError('DBContentOutlet', `Missing parameter 'id'`);
  if (typeof fields !== 'object')
    throwError('DBContentOutlet', `Missing parameter 'fields'`);

  const outlet = ContentOutlet.findOne({ _id: id });

  if (!outlet)
    throwError('DBContentOutlet', `Could not find content outlet '${id}'`);

  for (let [key, value] of Object.entries(fields)) {
    outlet[key] = value;
  }

  await outlet.save();

  await res.send(outlet.toObject({ depopulate: true }));
}

// GET /outlets
const getOutlets = async (req, res, next) => res.send(await ContentOutlet.find() || []);

module.exports = {
  getOutlet,
  createOutlet,
  updateOutlet,
  getOutlets
};
