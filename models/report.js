var mongoose = require('./mongoose.js');

var Schema = mongoose.Schema;

var PostSchema = new Schema({
    user : {type : String},
    post : {type : String}
});

PostSchema.methods.getUserPostSum = function(callback){
    console.info("进入到查询。。。。");
    return this.model('post').aggregate(
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
            console.log(result);
            callback(err, result);
        });
};

var postModel = mongoose.model('post', PostSchema);

module.exports = postModel;