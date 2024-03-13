var mongoose = require('mongoose');
const requirementSchema = require('../model/requirement');

requirementSchema.statics = {
    create: function (data) {
        var requirement = new this(data);
        return requirement.save().then(savedRequirement => {
            return savedRequirement; 
        });
    },

    get: function (query) {
        return this.find(query);
    },

    update: function (query, updateData) {
        return this.findOneAndUpdate(query, { $set: updateData }, { new: true });
    },

    createOrUpdate: function (query, data) {
        return this.findOneAndUpdate(query, { $set: data }, { upsert: true });
    },

    delete: function (query) {
        return this.deleteOne(query);
    },
};

var requirementModel = mongoose.model('requirements', requirementSchema);
module.exports = requirementModel;
