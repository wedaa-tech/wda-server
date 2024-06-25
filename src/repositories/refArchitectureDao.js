var mongoose = require('mongoose');
const refArchitectureSchema = require('../models/refArchitecture');

refArchitectureSchema.statics = {
    create: function (data) {
        var blueprint = new this(data);
        return blueprint.save();
    },

    get: function (query) {
        return this.find(query);
    },

    update: function (query, updateData) {
        return this.findOneAndUpdate(query, { $set: updateData }, { new: true });
    },

    createOrUpdate: function (query, data) {
        return this.findOneAndUpdate(query, { $set: data }, { upsert: true, new: true }).then(doc => {
            return doc._id;
        });
    },

    delete: function (query) {
        return this.deleteOne(query);
    },

    getAllProjectNames: function () {
        return this.find(
            { 'request_json.projectName': { $exists: true } },
            { 'request_json.projectName': 1, _id: 0 }
        ).then(results => results.map(result => result.request_json.projectName));
    }
};

var refArchitectureModel = mongoose.model('refArchitecture', refArchitectureSchema);
module.exports = refArchitectureModel;
