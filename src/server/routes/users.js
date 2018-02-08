const controllers = require('../controllers');
const { asyncMiddleware } = require('../util');

module.exports = (app) => {
  app
    .route('/createUser')
    .post(asyncMiddleware(controllers.users.create))
    .put(asyncMiddleware(controllers.users.convertToOtherUserType));
};
