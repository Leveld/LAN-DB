const controllers = require('../controllers');
const { asyncMiddleware } = require('capstone-utils');

module.exports = (app) => {
  app
    .route('/message')
    .get(asyncMiddleware(controllers.messages.conversations))
    .post(asyncMiddleware(controllers.messages.conversations))
    .patch(asyncMiddleware(controllers.messages.conversations));

  app
    .route('/messages')
    .get(asyncMiddleware(controllers.messages.conversations));
};
