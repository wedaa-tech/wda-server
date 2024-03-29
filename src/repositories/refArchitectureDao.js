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
        return this.findOneAndUpdate(query, { $set: data }, { upsert: true, new: true })
            .then((doc) => {
                return doc._id;
            });
    },

    delete: function (query) {
        return this.deleteOne(query);
    },
};

var refArchitectureModel = mongoose.model('refArchitecture', refArchitectureSchema);
module.exports = refArchitectureModel;
