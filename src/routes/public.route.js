var blueprintService = require('../services/blueprintService');
var refArchService = require('../services/refArchServices.js');
var wizardService = require('../services/wizardService.js');
var feedbackService = require('../services/feedbackService.js');
var tipsService = require('../services/tipsService.js');

module.exports = function (router) {
    router.get('/blueprints/:project_id', blueprintService.getBlueprint);

    router.get('/refArchs', refArchService.get);

    router.post('/wizard-template', wizardService.getWizardTemplate);

    router.post('/feedback', feedbackService.saveFeedback);

    router.get('/tips', tipsService.getTips);
};
