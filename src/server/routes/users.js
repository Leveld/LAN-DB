const controllers = require('../controllers');
const { asyncMiddleware } = require('capstone-utils');

module.exports = (app) => {
  app
    .route('/user/co')
    .patch(asyncMiddleware(controllers.users.addContentOutlet));
  app
    .route('/user')
    .get(asyncMiddleware(controllers.users.getUser))
    .post(asyncMiddleware(controllers.users.createUser))
    .put(asyncMiddleware(controllers.users.convertToOtherUserType))
    .patch(asyncMiddleware(controllers.users.updateUser));

  app
    .route('/users')
    .get(asyncMiddleware(controllers.users.getUsers));
};
