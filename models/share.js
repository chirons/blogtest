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

ShareSchema.methods.getUserPostSum = function(callback){
    console.info("进入到查询。。。。");
    return this.model('share').aggregate(
        {$match:{}},
        {$project: {user: 1, num: 1}},
        {$group: {
            _id: '$user',
            num: {$sum : 1}
        }}, function(err, result){
            if(err)
            {
                console.log("查询错误: " + err);
            }
            callback(err, result);
        });
};

var shareModel = mongoose.model('share', ShareSchema);

module.exports = shareModel;