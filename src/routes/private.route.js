var blueprintRoutes = require('./private/blueprint.route.js');
var refArchitectureRoutes = require('./private/refArch.route.js');
var projectRoutes = require('./private/project.route.js');

var core = require('../designer/core.js');
var feedbackService = require('../services/feedbackService.js');
var tipsService = require('../services/tipsService.js');
var dynamicTemplate = require('../services/dynamicTemplateService.js');
var codeGeneration = require('../services/codeGenerationService.js');
var projectnames = require('../services/projectNameService.js')
module.exports = function (router) {
    blueprintRoutes(router);
    refArchitectureRoutes(router);
    projectRoutes(router);

    // Common private routes
    router.post('/generate', core.generate);
    router.get('/download/:blueprintId', core.download);
    router.get('/feedback', feedbackService.getFeedbacks);
    router.post('/tips', tipsService.saveTip);
    router.post('/dynamic-template', dynamicTemplate.getDynamicTemplate);
    router.get('/project-names',projectnames.getProjectNames)
    router.post('/code-generation-status', codeGeneration.getCodeGenerationStatus);
};
