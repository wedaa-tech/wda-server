var mongoose = require('mongoose');
var creditSchema = require('../models/userCredits');

  creditSchema.statics = {
    createUserCredit: async function(userId,creditsAvailable,creditsUsed) {
        try {
            let userCredit = await this.findOne({ user_id: userId });
            if (userCredit) {
                const updatedCreditsAvailable = userCredit.creditsAvailable + creditsAvailable;
                const updatedCreditsUsed = userCredit.creditsUsed + creditsUsed;
                userCredit.creditsAvailable = updatedCreditsAvailable;
                userCredit.creditsUsed = updatedCreditsUsed;
            } else {
                userCredit = new this({
                    user_id: userId,
                    creditsAvailable: creditsAvailable,
                    creditsUsed: creditsUsed
                });
            }
    
            const result = await userCredit.save();
            return result;
        } catch (error) {
            throw new Error('Error creating or updating user credit');
        }
    },


    getAvailableCreditsDAO: async function(userId) {
        try {
            const userCredit = await this.findOne({ user_id: userId });
            if (userCredit) {
                return userCredit.creditsAvailable;
            } else {
                throw new Error('User credit not found');
            }
        } catch (error) {
            throw new Error('Error retrieving user credit');
        }
    }
    
    
}

var creditModel = mongoose.model('credit', creditSchema);

module.exports = creditModel;
