var wda = require('./controller');

module.exports = function(router) {
    router.get('/blueprint/:project_id',wda.getBlueprint);
    router.get('/blueprints',wda.getBlueprints);
    router.delete('/delete/:project_id', wda.deleteBlueprint);
    router.get('/projects', wda.getProjectNames);
}