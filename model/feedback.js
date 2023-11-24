var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbackSchema = new Schema(
    {
        name: {
            type: String,
            unique: false,
            required: false,
        },
        email: {
            type: String,
            unique: false,
            required: false,
        },
        user_id: {
            type: String,
            unique: false,
            required: false,
        },
        description: {
            type: String,
            unique: false,
            required: true,
        },
        rating: {
            type: Number,
            unique: false,
            required: true,
            min: 1,
            max: 5,
        }
    },
    {
        timestamps: true,
    },
);

module.exports = feedbackSchema;