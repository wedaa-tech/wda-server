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

// Update the compound index to include both name and user_id, enforcing uniqueness only for non-deleted documents
projectSchema.index({ name: 1, user_id: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

module.exports = projectSchema;
