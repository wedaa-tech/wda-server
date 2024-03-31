var blueprintRoutes = require('./private/blueprint.route.js');
var refArchitectureRoutes = require('./private/refArch.route.js');
var projectRoutes = require('./private/project.route.js');

var feedbackService = require('../services/feedbackService.js');
var tipsService = require('../services/tipsService.js');
var dynamicTemplate = require('../services/dynamicTemplateService.js');

module.exports = function (router) {
    blueprintRoutes(router);
    refArchitectureRoutes(router);
    projectRoutes(router);

    // Common private routes
    router.get('/feedback', feedbackService.getFeedbacks);
    router.post('/tips', tipsService.saveTip);
    router.post('/dynamic-template', dynamicTemplate.getDynamicTemplate);
};
