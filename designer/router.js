var wda = require('./controller');

module.exports = function(router) {
    router.get('/test' , wda.test);
    router.get('/blueprint/:project_id',wda.getBlueprint);
    router.get('/blueprints/:user_id',wda.getBlueprints);
    router.post('/generate', wda.generate);
}