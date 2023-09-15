var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
    name:{
        type: String,
        unique: true,
        required: true
    },
    user_id: {
        type: String,
        unique: false,
        required: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = projectSchema;