const controllers = require('../controllers');
const { asyncMiddleware } = require('capstone-utils');

module.exports = (app) => {
  app
    .route('/message')
    .get(asyncMiddleware(controllers.messages.getMessage))
    .post(asyncMiddleware(controllers.messages.createMessage))
    .patch(asyncMiddleware(controllers.messages.updateMessage));

  app
    .route('/messages')
    .get(asyncMiddleware(controllers.messages.getMessages));
};
