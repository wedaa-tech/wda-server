var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blueprintSchema = new Schema(
    {
        project_id: {
            type: String,
            unique: true,
            required: true,
        },
        request_json: {
            type: Schema.Types.Mixed,
            unique: false,
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
            required: false,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        parentId: {
            type: String,
            unique: false,
            required: false,
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
        validationStatus: {
            type: String,
            enum: ['VALIDATED', 'DRAFT'],
            default: 'DRAFT',
            required: true,
        },
        version: {
            type: Number,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = blueprintSchema;
