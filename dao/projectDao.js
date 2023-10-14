var mongoose = require('mongoose');
const projectSchema = require('../model/project');
const blueprintModel = require('./blueprintDao');

projectSchema.statics = {
    create: function (data) {
        var project = new this(data);
        return project.save();
    },

    get: async function (query) {
        try {
            const projects = await this.find({ ...query, deleted: false }).lean();

            if (projects && projects.length > 0) {
                const projectPromises = projects.map(async project => {
                    const blueprintCount = await blueprintModel.countDocuments({
                        parentId: project._id,
                        deleted: false
                    });
                    return {
                        id: project._id,
                        name: project.name,
                        description: project.description,
                        blueprintCount: blueprintCount,
                    };
                });

                return Promise.all(projectPromises);
            } else {
                return [];
            }
        } catch (error) {
            throw error;
        }
    },

    getByProjectId: function (query) {
        return this.find({ ...query, deleted: false })
            .lean()
            .then(results => {
                if (results && results.length > 0) {
                    return (
                        results.map(result => ({
                            id: result._id,
                            name: result.name,
                            imageUrl: result.imageUrl,
                            description: result.description,
                        })) || []
                    );
                }
            });
    },

    update: function (query, updateData) {
        return this.findOneAndUpdate(query, { $set: updateData }, { new: true });
    },

    deleteById: async function (query) {
        const updatedDoc = await this.findOneAndUpdate(
            query, 
            { $set: { deleted: true } }, 
            { new: true }
        );
        blueprintModel.deleteByParentId({ parentId: query._id });
        return updatedDoc;
    },

    delete: function (query) {
        return this.deleteOne(query);
    },
};

var projectModel = mongoose.model('project', projectSchema);
module.exports = projectModel;
