var mongoose = require('mongoose');
var codeGenerationSchema = require('../models/codeGeneration');

codeGenerationSchema.statics = {
    get: function (query) {
        return this.find(query);
    },

    createOrUpdate: function (query, data) {
        return this.findOneAndUpdate(query, { $set: data }, { upsert: true, new: true }).then(codeGeneration => {
            return codeGeneration;
        });
    },

    getStatusForBlueprints: async function (blueprintIds) {
        const pipeline = [
            { $match: { blueprintId: { $in: blueprintIds } } },
            // Sort by createdAt in descending order to ensure latest records come first
            { $sort: { createdAt: -1 } },
            // Group by blueprintId and get the status of the latest record
            {
                $group: {
                    _id: '$blueprintId',
                    status: { $first: '$status' },
                },
            },
            // Project only the blueprintId and status fields
            { $project: { _id: 0, blueprintId: '$_id', status: 1 } },
        ];
        const statusList = await this.aggregate(pipeline);
        return statusList;
    },
};

var codeGenerationModel = mongoose.model('code_generations', codeGenerationSchema);
module.exports = codeGenerationModel;
