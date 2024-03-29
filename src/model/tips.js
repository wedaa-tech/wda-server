var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tipsSchema = new Schema(
    {
        title: {
            type: String,
            unique: false,
            required: true,
        },
        description: {
            type: String,
            unique: false,
            required: true,
        },
        image: {
            type: String,
            unique: false,
            required: false,
        },
        user_id: {
            type: String,
            unique: false,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = tipsSchema;