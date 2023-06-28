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
        const projection = {
            _id: 1,
            project_id: 1,
            projectName: "$request_json.projectName",
            metadata: 1,
            createdAt: 1,
            updatedAt: 1
        };

        return this.find({
            ...query,
            metadata: { $ne: null },
            deleted: false
        }, projection)
            .sort({ createdAt: 1 })
    },

    // update: function(query, updateData, cb) {
    //     this.findOneAndUpdate(query, {$set: updateData},{new: true}, cb);
    // },

    deleteByProjectId: function (query) {
        return this.findOneAndUpdate(query, { $set: { deleted: true } }, { new: true });
    },

    getByProjectNamesAndUserId: function (query) {
        const projection = {
          _id: 0,
          "request_json.projectName": 1
        };
      
        return this.find({
          ...query,
          metadata: { $ne: null },
          deleted: false
        }, projection)
          .sort({ createdAt: 1 })
          .then(results => results.map(result => result.request_json.projectName));
      }
      
}

var blueprintModel = mongoose.model('blueprints', blueprintSchema);
module.exports = blueprintModel;