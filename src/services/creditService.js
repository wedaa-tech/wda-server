const creditDao = require('../repositories/creditDao');

async function createOrUpdateUserCreditService(userId, creditsCredited,creditsDebited) {
    try {
        const result = await creditDao.createUserCredit(userId, creditsCredited, creditsDebited);
        return result;
    } catch (error) {
        throw new Error('Error creating or updating user credit');
    }
}

async function getAvailableCreditsService(req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    try {
        const availableCredits = await creditDao.getAvailableCreditsDAO(userId);
        res.status(200).json({ availableCredits });
    } catch (error) {
        console.error('Error retrieving available credits:', error);
        res.status(500).json({ error: 'Error retrieving available credits' });
    }
}




module.exports = {
  createOrUpdateUserCreditService,
  getAvailableCreditsService
};
