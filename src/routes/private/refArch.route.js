var refArchService = require('../../services/refArchServices');

module.exports = function (router) {
    // TODO: Implement Role based Access!
    router.get('/refArchs/:id', refArchService.getRefArchById);
    router.post('/refArchs', refArchService.saveRefArch);
    router.delete('/refArchs/:id', refArchService.deleterefArchById);
    router.put('/refArchs/:id', refArchService.updateRefArchs);
    router.put('/publish/:id', refArchService.togglePublishedById);
};
