var blueprintService = require('./controller');
var refArchService = require('./refArchServices');
var projectService = require('./projectService');
var feedbackService = require('./feedbackService');
var tipsService = require('./tipsService');
var requirementService = require('./requirementService');
var dynamicTemplate = require('../designer/dynamicTemplateService.js');


module.exports = function (router) {
    router.get('/blueprints', blueprintService.getBlueprints);
    router.delete('/blueprints/:project_id', blueprintService.deleteBlueprint);
    router.get('/blueprints/names', blueprintService.getProjectNames);
    router.put('/blueprints/:project_id', blueprintService.updateBlueprint);
    router.get('/user/:project_id', blueprintService.verifyProject);
    router.post('/blueprints', blueprintService.saveAsDraft);

    router.get('/refArchs/:id', refArchService.getRefArchById);
    router.post('/refArchs', refArchService.saveRefArch);
    router.delete('/refArchs/:id', refArchService.deleterefArchById);
    router.put('/refArchs/:id', refArchService.updateRefArchs);
    router.put('/publish/:id', refArchService.togglePublishedById);

    router.post('/projects', projectService.saveProject);
    router.get('/projects', projectService.getProjects);
    router.get('/projects/:id', projectService.getProject);
    router.put('/projects/:id', projectService.updateProject);
    router.delete('/projects/:id', projectService.delete);

    router.get('/projects/architectures/:parentId', projectService.getArchitectures);
    router.get('/feedback', feedbackService.getFeedbacks);

    router.post('/tips', tipsService.saveTip);

    router.post('/requirements', requirementService.saveRequirement);
    router.put('/requirements/:id', requirementService.updateRequirement);

    router.post('/dynamic-template', dynamicTemplate.getDynamicTemplate);
};
