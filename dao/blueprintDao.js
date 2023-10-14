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
        return this.find({...query, deleted: false});
    },

    getByUserId: function (query) {
        const projection = {
            _id: 1,
            project_id: 1,
            projectName: "$request_json.projectName",
            parentId: 1,
            metadata: 1,
            imageUrl: 1,
            description: 1,
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

    createOrUpdate: function(query,data){
        return this.findOneAndUpdate(
            query, 
            {$set: data},
            {upsert: true}
        );
    },

    update: function(query, updateData) {
        return this.findOneAndUpdate(
            query, 
            {$set: updateData},
            {new: true}
        );
    },

    deleteByProjectId: function (query) {
        return this.findOneAndUpdate(
            query, 
            { $set: { deleted: true } }, 
            { new: true }
        );
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
      },

    deleteByParentId: function (query) {
        return this.updateMany(
            query,
            { $set: { deleted: true } }
        ).exec();
    }
      
}

var blueprintModel = mongoose.model('blueprints', blueprintSchema);
module.exports = blueprintModel;
