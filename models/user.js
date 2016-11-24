var mongodb = require('./db');

function User(user)
{
    this.name = user.name;
    this.password = user.password;
    this.pic = user.pic;
    this.gender = user.gender;
    this.borth = user.borth;
}

module.exports = User;

User.prototype.save = function(callback)
{
    var user = {name : this.name, password : this.password, pic : this.pic, gender : this.gender, borth : this.borth};

    mongodb.open(function(err, db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('users', function(err, collection){
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('name', {unique : true}, function(err){
                collection.insert(user, {safe:true}, function(err, user){
                    mongodb.close();
                    callback(err, user);
                });
            });
        });
    });
};

User.update = function(user, callback)
{
    mongodb.open(function(err, db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('users', function(err, collection){
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            var tmp = {};
            if(user.borth){tmp.borth = user.borth;}
            if(user.gender){tmp.gender = user.gender;}
            if(user.pic){tmp.pic = user.pic;}
            collection.update({name:user.name}, {$set:tmp}, function(err){
                    mongodb.close();
                    callback(err);
                });
        });
    });
};

User.changepwd = function(user, callback)
{
    mongodb.open(function(err, db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('users', function(err, collection){
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.update({name:user.name}, {$set:{password : user.password}}, function(err){
                mongodb.close();
                callback(err);
            });
        });
    });
};

User.get = function(username, callback)
{
    mongodb.open(function(err, db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('users', function(err, collection) {
            if (err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({name:username}, function(err, doc){
                mongodb.close();
                if(doc)
                {
                    var user = new User(doc);
                    callback(err, user);
                }
                else
                {
                    callback(err, null);
                }
            });
        });
    });
};