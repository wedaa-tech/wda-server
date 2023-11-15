var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema(
    {
        name: {
            type: String,
            unique: false,
            required: true,
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
    },
    {
        timestamps: true,
    },
);

// Define a unique compound index that enforces uniqueness only for non-deleted documents
projectSchema.index({ name: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

module.exports = projectSchema;
