var creditService = require('../../services/creditService');

module.exports = function (router) {

    router.get('/credits', creditService.getAvailableCreditsService);

};
