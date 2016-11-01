/**
 * Created by root on 16-10-28.
 */

var mongodb = require('./db');
//定义对象
function Post(username, post, time)
{
    this.user = username;
    this.post = post;
    if(time)
    {
        this.time = time;
    }
    else
    {
        this.time = new Date();
    }
}

module.exports = Post;
//保存对象
Post.prototype.save = function(callback)
{
    var post = {username : this.user, post:this.post, time:this.time};

    mongodb.open(function(err, db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('posts', function(err, collection){
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('user', {unique : true}, function(err){
                collection.insert(post, {safe:true}, function(err, user){
                    mongodb.close();
                    callback(err, user);
                });
            });
        });
    });
}
//查询列表
Post.get = function(username, callback)
{
    mongodb.open(function(err, db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err)
            {
                mongodb.close();
                return callback(err);
            }

            var query = {};
            if(username)
            {
                query.username = username;
            }

            collection.find(query).sort({time:-1}).toArray(function(err, docs){
                mongodb.close();
                if(err)
                {
                    callback(err, null);
                }


                var posts = [];
                docs.forEach(function(doc, index){
                    var post = new Post(doc.username, doc.post, doc.time);
                    posts.push(post);
                });

                callback(null, posts);
            });
        });
    });
}

