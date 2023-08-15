var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var refArchSchema = new Schema({
    name :{
        type: String,
        unique : false,
        required : true
    },
    refArch_id :{
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
    }
}, {
    timestamps: true
});

module.exports = refArchSchema;