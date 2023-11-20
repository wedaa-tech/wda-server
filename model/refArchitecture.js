var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var refArchSchema = new Schema(
    {
        id: {
            type: String,
            unique: true,
            required: true,
        },
        name: {
            type: String,
            unique: true,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            unique: false,
            required: false,
        },
        user_id: {
            type: String,
            unique: false,
            required: true,
        },
        type: {
            type: String,
            enum: ['APPLICATION', 'INFRASTRUCTURE', 'DATA_PIPELINES', 'DEV_SEC_OPS'],
            default: 'APPLICATION',
            required: true,
        },
        published: {
            type: Boolean,
            default: false,
        },
        imageUrl: {
            type: String,
            unique: false,
            required: false,
        },
        description: {
            type: String,
            unique: false,
            required: false,
        },
        request_json: {
            type: Schema.Types.Mixed,
            unique: false,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = refArchSchema;
