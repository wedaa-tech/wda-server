var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var requirementSchema = new Schema(
    {
        title: {
            type: String,
            unique: false,
            required: true,
        },
        description: {
            type: String,
            unique: false,
            required: false,
        },
        stage: {
            type: Number,
            unique: false,
            required: false,

        },
        services: [
            {
                name: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    required: false,
                },
                _id: false, // Disable the generation of _id for services
            },
            
        ],
        blueprintId: {
            type: String,
            unique: false,
            required: false,
           
        },
        user_id: {
            type: String,
            unique: false,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = requirementSchema;