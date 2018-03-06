const controllers = require('../controllers');
const { asyncMiddleware } = require('capstone-utils');

module.exports = (app) => {
  app
    .route('/outlet')
    .get(asyncMiddleware(controllers.contentOutlet.getOutlet))
    .post(asyncMiddleware(controllers.contentOutlet.createOutlet))
    .patch(asyncMiddleware(controllers.contentOutlet.updateOutlet));

  app
    .route('/outlets')
    .get(asyncMiddleware(controllers.contentOutlet.getOutlets));

  app
    .route('/coInfo')
    .get(asyncMiddleware(controllers.contentOutlet.getContentOutletInfo));
};
