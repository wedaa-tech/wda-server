var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userCreditSchema = new Schema(
    {
        user_id: {
            type: String,
            required: true,
            unique:true
        },
        creditsAvailable: {
            type: Number,
            required: true,
        },
        creditsUsed: {
            type: Number,
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = userCreditSchema;
