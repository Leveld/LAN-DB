const users = require('./users');
const contentOutlet = require('./contentOutlet');

module.exports = (app) => {
  users(app);
  contentOutlet(app);
};
