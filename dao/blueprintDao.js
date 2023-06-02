var mongoose = require('mongoose');
var blueprintSchema = require('../model/blueprint');

blueprintSchema.statics = {

    create : function(data) {
        var blueprint = new this(data);
        return blueprint.save();
    },

    get: function(query) {
      return this.find(query);
    },

    getByProjectId: function(query) {
        return this.find(query);
    },

    getByUserId: function(query) {
        return this.find(query);
    },

    // update: function(query, updateData, cb) {
    //     this.findOneAndUpdate(query, {$set: updateData},{new: true}, cb);
    // },

    // delete: function(query, cb) {
    //     this.findOneAndDelete(query,cb);
    // }
}

var blueprintModel = mongoose.model('blueprints', blueprintSchema);
module.exports = blueprintModel;