var blueprintService = require('./controller');
var refArchService = require('./refArchServices');
var projectService = require('./projectService');

module.exports = function(router) {
    router.get('/blueprints',blueprintService.getBlueprints);
    router.delete('/blueprints/:project_id', blueprintService.deleteBlueprint);
    router.get('/blueprints/names', blueprintService.getProjectNames);
    router.put('/blueprints/:project_id',blueprintService.updateBlueprint);
    router.get('/user/:project_id',blueprintService.verifyProject);
    router.post('/blueprints',blueprintService.saveAsDraft);

    router.get('/refArchs',refArchService.get);
    router.get('/refArchs/:id',refArchService.getRefArchById);
    router.post('/refArchs',refArchService.saveRefArch);
    router.delete('/refArchs/:id',refArchService.delete);
    router.put('/refArchs/:id',refArchService.updateRefArchs);

    router.post('/projects', projectService.saveProject);
    router.get('/projects', projectService.getProjects);
    router.get('/projects/:id', projectService.getProject);
    router.put('/projects/:id', projectService.updateProject);
    router.delete('/projects/:id', projectService.delete);

    router.get('/projects/architectures/:parentId', projectService.getArchitectures);


}