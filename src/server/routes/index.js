const campaigns = require('./campaigns');
const contentOutlet = require('./contentOutlet');
const contracts = require('./contracts');
const conversations = require('./conversations');
const messages = require('./messages');
const users = require('./users');

module.exports = (app) => {
  campaigns(app);
  contentOutlet(app);
  contracts(app);
  conversations(app);
  messages(app);
  users(app);
};
