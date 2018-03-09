const controllers = require('../controllers');
const { asyncMiddleware } = require('capstone-utils');

module.exports = (app) => {
  app
    .route('/campaign/contract')
    .patch(asyncMiddleware(controllers.campaigns.addContract));

  app
    .route('/campaign')
    .get(asyncMiddleware(controllers.campaigns.getCampaign))
    .post(asyncMiddleware(controllers.campaigns.createCampaign))
    .patch(asyncMiddleware(controllers.campaigns.updateCampaign));

  app
    .route('/campaigns')
    .get(asyncMiddleware(controllers.campaigns.getCampaigns));
};
