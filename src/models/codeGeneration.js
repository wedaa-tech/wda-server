var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var codeGenerationSchema = new Schema(
    {
        blueprintId: {
            type: String,
            unique: false,
            required: true,
        },
        status: {
            type: String,
            enum: ['SUBMITTED', 'IN-PROGRESS', 'COMPLETED'],
            default: 'SUBMITTED',
            required: true,
        },
        error: {
            type: String,
            unique: false,
            required: false,
        },
        blueprintVersion: {
            type: Number,
            unique: false,
            required: true,
        }
    },
    {
        timestamps: true,
    },
);

module.exports = codeGenerationSchema;
