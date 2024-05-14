var transactionLogService = require('../../services/transactionLogService');

module.exports = function (router) {

    router.post('/admin/transaction', transactionLogService.createOrUpdateTransactionByAdmin);
    router.post('/user/transaction', transactionLogService.createOrUpdateTransactionByUser);    
    router.post('/credits/request', transactionLogService.requestCredits);
    router.post('/transaction', transactionLogService.updateTransactionById);
    router.get('/transactions/:status', transactionLogService.fetchTransactionsByStatus);
    router.get('/transactions', transactionLogService.fetchTransactionsByUser);

};
