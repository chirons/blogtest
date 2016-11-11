var mongoose = require('./mongoose.js');

var Schema = mongoose.Schema;

var ShareSchema = new Schema({
    user : {type : String},
    marker : {type : String},
    time : {type : String},
    editor1 : {type : String}
});

ShareSchema.methods.getByMarker = function(marker, callback){
    var query = {};
    query['marker'] = new RegExp(marker);

    this.model('share').find(query, function(err, list){
        callback(err, list);
    });
};

var shareModel = mongoose.model('share', ShareSchema);

module.exports = shareModel;