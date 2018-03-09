const controllers = require('../controllers');
const { asyncMiddleware } = require('capstone-utils');

module.exports = (app) => {
  app
    .route('/conversation')
    .get(asyncMiddleware(controllers.conversations.getConversation))
    .post(asyncMiddleware(controllers.conversations.createConversation))
    .patch(asyncMiddleware(controllers.conversations.updateConversation));

  app
    .route('/conversations')
    .get(asyncMiddleware(controllers.conversations.getConversations));
};
