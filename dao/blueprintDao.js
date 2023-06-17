var mongoose = require('mongoose');
var blueprintSchema = require('../model/blueprint');

blueprintSchema.statics = {

    create: function (data) {
        var blueprint = new this(data);
        return blueprint.save();
    },

    get: function (query) {
        return this.find(query);
    },

    getByProjectId: function (query) {
        return this.find(query);
    },

    getByUserId: function (query) {
        return this.aggregate([
            { $match: { ...query, metadata: { $ne: null }, deleted: false } },
            {
                $project: {
                    _id: 1,
                    project_id: 1,
                    projectName: "$request_json.projectName",
                    metadata: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
    },

    // update: function(query, updateData, cb) {
    //     this.findOneAndUpdate(query, {$set: updateData},{new: true}, cb);
    // },

    deleteByProjectId: function (query) {
        return this.findOneAndUpdate(query, { $set: { deleted: true } }, { new: true });
    }
}

var blueprintModel = mongoose.model('blueprints', blueprintSchema);
module.exports = blueprintModel;