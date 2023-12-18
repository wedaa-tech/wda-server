var wda = require('../designer/controller.js');
var refArchService = require('../designer/refArchServices');
var wizardService = require('../designer/wizardService.js');
var feedbackService = require('../designer/feedbackService');
var tipsService = require('../designer/tipsService');

module.exports = function (router) {
    router.post('/generate', wda.generate);
    router.get('/blueprints/:project_id', wda.getBlueprint);

    router.get('/refArchs', refArchService.get);

    router.post('/wizard-template', wizardService.getWizardTemplate);

    router.post('/feedback', feedbackService.saveFeedback);

    router.get('/tips', tipsService.getTips);
};
