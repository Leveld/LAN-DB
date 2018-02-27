const users = require('./users');
const contentOutlet = require('./contentOutlet');
const contracts = require('./contracts');
const campaigns = require('./campaigns');

module.exports = (app) => {
  users(app);
  contentOutlet(app);
  contracts(app);
  campaigns(app);
};
