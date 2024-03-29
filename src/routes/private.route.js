var blueprintRoutes = require('./private/blueprint.route.js');
var refArchitectureRoutes = require('./private/refArch.route.js');
var projectRoutes = require('./private/project.route.js');

var feedbackService = require('../designer/feedbackService.js');
var tipsService = require('../designer/tipsService.js');
var dynamicTemplate = require('../designer/dynamicTemplateService.js');

module.exports = function (router) {
    blueprintRoutes(router);
    refArchitectureRoutes(router);
    projectRoutes(router);

    // Common private routes
    router.get('/feedback', feedbackService.getFeedbacks);
    router.post('/tips', tipsService.saveTip);
    router.post('/dynamic-template', dynamicTemplate.getDynamicTemplate);
};
