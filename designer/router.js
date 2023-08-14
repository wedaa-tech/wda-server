var wda = require('./controller');

module.exports = function(router) {
    router.get('/blueprints',wda.getBlueprints);
    router.delete('/blueprints/:project_id', wda.deleteBlueprint);
    router.get('/projects', wda.getProjectNames);
    router.put('/blueprints/:project_id',wda.updateBlueprint);
    router.get('/user/:project_id',wda.verifyProject);
    router.post('/blueprints',wda.saveAsDraft);
}