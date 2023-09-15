var mongoose = require('mongoose');
const projectSchema = require('../model/project');

projectSchema.statics = {

    create: function (data) {
        var project = new this(data);
        return project.save();
    },

    get: function (query) {
        return this.find(query)
            .lean()
            .then((results) => {
                if (results && results.length > 0) {
                    return results.map((result) => ({
                        id: result._id,
                        name: result.name,
                        imageUrl: result.imageUrl,
                        description: result.description
                    })) || [];
                }
            });
    },

    getByProjectId: function (query) {
        return this.find(query)
            .lean()
            .then((results) => {
                if (results && results.length > 0) {
                    return results.map((result) => ({
                        id: result._id,
                        name: result.name,
                        imageUrl: result.imageUrl,
                        description: result.description
                    })) || [];
                }
            });
    },

    update: function (query, updateData) {
        return this.findOneAndUpdate(query, { $set: updateData }, { new: true });
    },

    delete: function (query) {
        return this.deleteOne(query);
    },

}

var projectModel = mongoose.model('project', projectSchema);
module.exports = projectModel;