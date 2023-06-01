var wda = require('./controller');

module.exports = function(router) {
    router.get('/test' , wda.test);
    router.post('/generate', wda.generate);
}