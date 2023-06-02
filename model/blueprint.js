var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blueprintSchema = new Schema({
    project_id :{
        type: String,
        unique : true,
        required : true
    },
    request_json : {
        type: Schema.Types.Mixed,
        unique : false,
        required : true
    },
    main_json : {
        type: Schema.Types.Mixed,
        unique : false,
        required : true
    },
    metadata : {
        type: Schema.Types.Mixed,
        unique : false,
        required : false
    },
    user_id: {
        type: String,
        unique: true,
        sparse: true,
        required: false
      }
}, {
    timestamps: true
});

module.exports = blueprintSchema;