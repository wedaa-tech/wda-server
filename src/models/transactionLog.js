var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var transactionLogSchema = new Schema(
    {
        user_id: {
            type: String,
            required: true,
        },
        credits: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['REQUESTED', 'CREDITED', 'DEBITED','REJECTED','PENDING'],
            required: true,
        },
        approved_by: {
            type: String,
            required:false
        },
        blueprintId: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = transactionLogSchema;
