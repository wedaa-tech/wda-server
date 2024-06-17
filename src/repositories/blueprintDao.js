var mongoose = require('mongoose');
var blueprintSchema = require('../models/blueprint');

blueprintSchema.statics = {
    create: function (data) {
        var blueprint = new this(data);
        return blueprint.save();
    },

    get: function (query) {
        return this.find(query);
    },

    getByProjectId: async function (query) {
        const blueprints = await this.aggregate([
            // Match the specific blueprint based on project_id and not deleted
            { $match: { ...query, deleted: false } },
            // Lookup the latest code generation for the matched blueprint
            {
                $lookup: {
                    from: 'code_generations',
                    let: {
                        blueprintId: '$project_id',
                        blueprintVersion: '$version',
                    },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$blueprintId', '$$blueprintId'] } } },
                        { $match: { $expr: { $eq: ['$blueprintVersion', '$$blueprintVersion'] } } },
                        { $sort: { createdAt: -1 } }, // Sort code generations by createdAt in descending order
                        { $limit: 1 }, // Get only the latest code generation
                    ],
                    as: 'latestCodeGeneration',
                },
            },
            // Project fields to include
            {
                $project: {
                    _id: 1,
                    project_id: 1,
                    request_json: 1,
                    metadata: 1,
                    user_id: 1,
                    deleted: 1,
                    parentId: 1,
                    imageUrl: 1,
                    description: 1,
                    validationStatus: 1,
                    version: 1,
                    latestCodeGenerationStatus: { $arrayElemAt: ['$latestCodeGeneration.status', 0] }, // Extract status from the latestCodeGeneration array
                },
            },
        ]);

        return blueprints;
    },

    getByUserId: async function (query) {
        const pipeline = [
            // Match blueprints based on the query and not deleted
            { $match: { ...query, metadata: { $ne: null }, deleted: false } },
            // Lookup the latest code generation for each matched blueprint
            {
                $lookup: {
                    from: 'code_generations',
                    let: {
                        blueprintId: '$project_id',
                        blueprintVersion: '$version',
                    },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$blueprintId', '$$blueprintId'] } } },
                        { $match: { $expr: { $eq: ['$blueprintVersion', '$$blueprintVersion'] } } },
                        { $sort: { createdAt: -1 } }, // Sort code generations by createdAt in descending order
                        { $limit: 1 }, // Get only the latest code generation
                    ],
                    as: 'latestCodeGeneration',
                },
            },
            // Project fields to include
            {
                $project: {
                    _id: 1,
                    project_id: 1,
                    projectName: '$request_json.projectName',
                    draft: '$request_json.services',
                    parentId: 1,
                    metadata: 1,
                    imageUrl: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    validationStatus: 1,
                    latestCodeGenerationStatus: { $arrayElemAt: ['$latestCodeGeneration.status', 0] }, // Extract status from the latestCodeGeneration array
                },
            },
            // Sort by updatedAt in descending order
            { $sort: { updatedAt: -1 } },
        ];

        const result = await this.aggregate(pipeline);
        return result;
    },

    createOrUpdate: function (query, data) {
        return this.findOneAndUpdate(query, { $set: data }, { upsert: true, new: true }).then(blueprint => {
            return blueprint;
        });
    },

    update: function (query, updateData) {
        return this.findOneAndUpdate(query, { $set: updateData }, { new: true });
    },

    deleteByProjectId: function (query) {
        return this.findOneAndUpdate(query, { $set: { deleted: true } }, { new: true });
    },

    getByProjectNamesAndUserId: function (query) {
        const projection = {
            _id: 0,
            'request_json.projectName': 1,
        };

        return this.find(
            {
                ...query,
                metadata: { $ne: null },
                deleted: false,
            },
            projection,
        )
            .sort({ createdAt: 1 })
            .then(results => results.map(result => result.request_json.projectName));
    },

    deleteByParentId: function (query) {
        return this.updateMany(query, { $set: { deleted: true } }).exec();
    },

    getByProjectIds: async function (projectIds) {
        const blueprints = await this.aggregate([
            { $match: { project_id: { $in: projectIds }, deleted: false } },
            {
                $lookup: {
                    from: 'code_generations',
                    let: { blueprintId: '$project_id', blueprintVersion: '$version' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$blueprintId', '$$blueprintId'] } } },
                        { $match: { $expr: { $eq: ['$blueprintVersion', '$$blueprintVersion'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                    ],
                    as: 'latestCodeGeneration',
                },
            },
            {
                $project: {
                    _id: 1,
                    project_id: 1,
                    request_json: 1,
                    metadata: 1,
                    user_id: 1,
                    deleted: 1,
                    parentId: 1,
                    imageUrl: 1,
                    description: 1,
                    validationStatus: 1,
                    version: 1,
                    latestCodeGenerationStatus: { $arrayElemAt: ['$latestCodeGeneration.status', 0] },
                },
            },
        ]);

        return blueprints;
    },

};

var blueprintModel = mongoose.model('blueprints', blueprintSchema);
module.exports = blueprintModel;
