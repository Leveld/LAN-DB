const controllers = require('../controllers');
const { asyncMiddleware } = require('../util');

module.exports = (app) => {
  app
    .route('/user')
    .get(asyncMiddleware(controllers.users.getUser))
    .post(asyncMiddleware(controllers.users.createUser))
    .put(asyncMiddleware(controllers.users.convertToOtherUserType))
    .patch(asyncMiddleware(controllers.users.updateUser));
};
