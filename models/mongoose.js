var settings = require('../settings');

var mongoose = require('mongoose');

var uri = 'mongodb://'+settings.host+ ':' + settings.port + '/' + settings.db;

mongoose.connect(uri, function(err){

    if (err)
    {
        console.log("数据库 ["+ uri + "] 连接异常:" + err);
        throw err;
    }
    console.log("数据库 ["+ uri + "] 连接成功!!!");
});

module.exports = mongoose;