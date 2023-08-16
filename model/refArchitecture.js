var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var refArchSchema = new Schema({
    name :{
        type: String,
        unique : true,
        required : true
    },
    metadata : {
        type: Schema.Types.Mixed,
        unique : false,
        required : false
    },
    user_id: {
        type: String,
        unique: false,
        required: true
    },
    type: {
        type: String,
        enum: ['APPLICATION','INFRASTRUCTURE','DATA_PIPELINES','DEV_SEC_OPS'],
        default: 'APPLICATION',
        required: true
    }
}, {
    timestamps: true
});

module.exports = refArchSchema;