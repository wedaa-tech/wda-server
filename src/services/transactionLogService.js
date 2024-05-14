const transactionLogDao = require('../repositories/transactionLogDao.js');
const creditService = require('./creditService.js');
const { transactionStatus } = require('../utils/constants.js'); 

async function createOrUpdateTransactionByAdmin(req, res) {
    const roles = req?.kauth?.grant?.access_token?.content?.realm_access?.roles;
    // Check if the "ADMIN" role is present in the roles array
    if (roles && roles.includes('ADMIN')) {
        try {
            const approvedBy = req.kauth.grant.access_token.content.sub;
            const { credits, status, userId } = req.body;
            const transaction = await transactionLogDao.createTransactionByAdmin(userId, credits, status, approvedBy);
            console.log('---Updating user credits----');
            if (status == transactionStatus.CREDITED) {
                await creditService.createOrUpdateUserCreditService(userId, credits, 0);
            } else if (status == transactionStatus.DEBITED) {
                await creditService.createOrUpdateUserCreditService(userId, credits * -1, credits);
            }
            res.status(200).json(transaction);
        } catch (error) {
            res.status(500).json({ error: `Failed to create/update transaction by admin: ${error}` });
        }
    } else {
        // If "ADMIN" role is not present, send a message indicating unauthorized access
        return res.status(403).send({ message: 'User is not authorized!' });
    }
}

async function createOrUpdateTransactionByUser(req, res) {
    try {
        const userId = req.kauth.grant.access_token.content.sub;
        const { credits, status, blueprintId } = req.body;
        const transaction = await transactionLogDao.createTransactionByUser(userId, credits, status, blueprintId);
        console.log('---Updating user credits----');
        if (status == transactionStatus.CREDITED) {
            await creditService.createOrUpdateUserCreditService(userId, credits, 0);
        } else if (status == transactionStatus.DEBITED) {
            await creditService.createOrUpdateUserCreditService(userId, credits * -1, credits);
        }
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ error: `Failed to create/update transaction by user: ${error}` });
    }
}

async function requestCredits(req, res) {
    try {
        const userId = req.kauth.grant.access_token.content.sub;
        const { credits, status } = req.body;
        const transaction = await transactionLogDao.requestCredits(userId, credits, status);
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ error: `Failed to request credits: ${error}` });
    }
}

async function updateTransactionById(req, res) {
    const roles = req?.kauth?.grant?.access_token?.content?.realm_access?.roles;
    // Check if the "ADMIN" role is present in the roles array
    if (roles && roles.includes('ADMIN')) {
        try {
            const approvedBy = req.kauth.grant.access_token.content.sub;
            const { transactionId, credits, status, userId } = req.body;
            const transaction = await transactionLogDao.updateTransactionById(transactionId, userId, credits, status, approvedBy);
            console.log('---Updating user credits----');
            if (status == transactionStatus.CREDITED) {
                 await creditService.createOrUpdateUserCreditService(userId, credits, 0);
            } else if (status == transactionStatus.DEBITED) {
                 await creditService.createOrUpdateUserCreditService(userId, credits * -1, credits);
            }
            res.status(200).json(transaction);
        } catch (error) {
            res.status(500).json({ error: `Failed to update transaction by ID: ${error}` });
        }
    } else {
        // If "ADMIN" role is not present, send a message indicating unauthorized access
        return res.status(403).send({ message: 'User is not authorized!' });
    }
}

async function fetchTransactionsByStatus(req, res) {
    const roles = req?.kauth?.grant?.access_token?.content?.realm_access?.roles;
    // Check if the "ADMIN" role is present in the roles array
    if (roles && roles.includes('ADMIN')) {
        try {
            const userId = req.kauth.grant.access_token.content.sub;
            const { page, limit } = req.query;

            const status  = req.params.status;
            const transactions = await transactionLogDao.fetchTransactionsByStatus(status);

            const startIndex = (page-1) * limit ;
            const lastIndex = page * limit ;

            const transactionList = transactions.slice(startIndex,lastIndex)
            res.status(200).json({transactions:transactionList,length:transactions.length});
        } catch (error) {
            res.status(500).json({ error: `Failed to fetch transactions by status: ${error}` });
        }
    } else {
        // If "ADMIN" role is not present, send a message indicating unauthorized access
        return res.status(403).send({ message: 'User is not authorized!' });
    }
}

async function fetchTransactionsByUser(req, res) {
    try {
        const userId = req.kauth.grant.access_token.content.sub;
        const { page, limit } = req.query;
        const transactions = await transactionLogDao.fetchTransactionsByUser({ user_id:userId });
        
        const startIndex = (page-1) * limit ;
        const lastIndex = page * limit ;

        const transactionList = transactions.slice(startIndex,lastIndex)
        res.status(200).json({transactions:transactionList,length:transactions.length});
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch transactions by user: ${error.message}` });
    }
}


module.exports = {
    createOrUpdateTransactionByAdmin,
    createOrUpdateTransactionByUser,
    requestCredits,
    updateTransactionById,
    fetchTransactionsByStatus,
    fetchTransactionsByUser
};
