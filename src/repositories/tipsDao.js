var mongoose = require('mongoose');
const tipsSchema = require('../models/tips');

tipsSchema.statics = {
    create: function (data) {
        var tip = new this(data);
        return tip.save();
    },

    get: function (query) {
        return this.find(query).select('_id title description image');
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

var tipsModel = mongoose.model('tip', tipsSchema);
module.exports = tipsModel;
