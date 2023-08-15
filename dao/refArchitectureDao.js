var mongoose = require('mongoose');
const refArchitectureSchema = require('../model/refArchitecture');

refArchitectureSchema.statics = {

    create: function (data) {
        var blueprint = new this(data);
        return blueprint.save();
    },

    get: function (query) {
        return this.find(query);
    },

    update: function(query, updateData) {
        return this.findOneAndUpdate(query, {$set: updateData},{new: true});
    },

    delete: function (query) {
        return this.deleteOne(query);
    },
      
}

var refArchitectureModel = mongoose.model('refArchitecture', refArchitectureSchema);
module.exports = refArchitectureModel;