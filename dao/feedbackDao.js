var mongoose = require('mongoose');
const feedbackSchema = require('../model/feedback');

feedbackSchema.statics = {
    create: function (data) {
        var feedback = new this(data);
        return feedback.save();
    },

    get: function (query) {
        return this.find(query);
    }
};

var feedbackModel = mongoose.model('feedback', feedbackSchema);
module.exports = feedbackModel;