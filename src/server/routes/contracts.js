const controllers = require('../controllers');
const { asyncMiddleware } = require('capstone-utils');

module.exports = (app) => {
  app
    .route('/contract')
    .get(asyncMiddleware(controllers.contracts.getContract))
    .post(asyncMiddleware(controllers.contracts.createContract))
    .patch(asyncMiddleware(controllers.contracts.updateContract));
};
