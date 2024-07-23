var blueprintService = require('../../services/blueprintService');

module.exports = function (router) {
    router.get('/blueprints', blueprintService.getBlueprints);
    router.delete('/blueprints/:project_id', blueprintService.deleteBlueprint);
    router.get('/blueprints/names', blueprintService.getProjectNames);
    router.put('/blueprints/:project_id', blueprintService.updateBlueprint);
    router.get('/user/:project_id', blueprintService.verifyProject);
    router.post('/blueprints', blueprintService.saveAsDraft);
    router.post('/blueprints/metadata',blueprintService.getMetadata);
};
