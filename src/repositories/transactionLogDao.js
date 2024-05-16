var mongoose = require('mongoose');
var transactionLogSchema = require('../models/transactionLog');

  transactionLogSchema.statics = {
    createTransactionRequest: async function(data) {
        return this.create({ data });
    },

    updateTransactionRequestStatus: async function(requestId, status, approved_by) {
        return this.findByIdAndUpdate(requestId, { status, approved_at: Date.now(), approved_by }, { new: true });
    },

    createTransactionByAdmin: async function(userId, credits, status, approvedBy) {
        try {
            let transaction = await this.create({
                user_id: userId,
                credits: credits,
                status: status,
                approved_by: approvedBy
            });
            return transaction;
        } catch (error) {
            throw new Error(`Failed to create transaction: ${error}`);
        }
    },
    

    createTransactionByUser: async function(userId, credits, status, blueprintId) {
        try {
            let transaction = await this.create({
                user_id: userId,
                credits: credits,
                status: status,
                blueprintId: blueprintId
            });
            return transaction;
        } catch (error) {
            throw new Error(`Failed to create transaction: ${error}`);
        }
    },
    
    requestCredits: async function(userId, credits, status) {
        try {
            let transaction = await this.create({
                user_id: userId,
                credits: credits,
                status: status
            });
            return transaction;
        } catch (error) {
            throw new Error(`Failed to request credits: ${error}`);
        }
    },
    

 updateTransactionById: async function(transactionId, userId, credits, status, approvedBy) {
    try {
        let transaction = await this.findByIdAndUpdate(
            transactionId,
            { user_id: userId, credits, status, approved_by: approvedBy },
            { new: true }
        );
        return transaction;
    } catch (error) {
        throw new Error(`Failed to update transaction: ${error}`);
    }
},

updateTransactionByBlueprintId: async function(blueprintId,status) {
    try {
        let transaction = await this.findOne({ blueprintId }).sort({ createdAt: -1 });
        transaction.status = status;
        await transaction.save();
        return transaction;
    } catch (error) {
        throw new Error(`Failed to update transaction: ${error}`);
    }
},

 fetchTransactionsByStatus: async function(status) {
    try {
        const transactions = await this.aggregate([
            { $match: { status } },
            {
                $lookup: {
                    from: 'credits',
                    let: {
                        user_id: '$user_id',
                    },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } },
                        { $limit: 1 },
                    ],
                    as: 'user',
                },
            },
            {
                $project: {
                    _id:1,
                    user_id:1,
                    credits: 1,
                    updatedAt: 1,
                    creditsUsed: { $arrayElemAt: ['$user.creditsUsed', 0] },
                    creditsAvailable: { $arrayElemAt: ['$user.creditsAvailable', 0] },
                }
            },
            { $sort: { updatedAt: -1 } },
        ]);
        return transactions;
    } catch (error) {
        throw new Error(`Failed to fetch transactions by status: ${error}`);
    }
},

fetchTransactionsByUser: async function(query) {
    try {
        const transactions = await this.aggregate([
            { $match: { ...query } },
            {
                $lookup: {
                    from: 'blueprints',
                    let: {
                        project_id: '$blueprintId',
                    },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$project_id', '$$project_id'] } } },
                        { $limit: 1 },
                    ],
                    as: 'blueprint',
                },
            },
            {
                $project: {
                    credits: 1,
                    status: 1,
                    updatedAt: 1,
                    projectName: { $arrayElemAt: ['$blueprint.request_json.projectName', 0] },
                    imageUrl: { $arrayElemAt: ['$blueprint.imageUrl', 0] },
                    services: { $arrayElemAt: ['$blueprint.request_json.services', 0] }
                }
            },
            { $sort: { updatedAt: -1 } },
        ])
        return transactions;
    } catch (error) {
        throw new Error(`Failed to fetch transactions by user: ${error.message}`);
    }
}
}

var transactionLogModel = mongoose.model('transactionLog', transactionLogSchema);

module.exports = transactionLogModel;
