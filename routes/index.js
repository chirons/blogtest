var express = require('express');
var fs = require('fs');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Share = require('../models/share.js');

/* GET home page. */
router.get('/', function(req, res) {
  Post.get(null, function(err, posts){
    if(err){posts = [];}
    res.render('index', {title : '首页', posts : posts});
  });
});

router.get('/u/:user', function(req, res) {
  User.get(req.params.user, function(err, user){
    if(!user)
    {
      req.flash('error', '用户不存在');
      return res.redirect('/');
    }
    Post.get(user.name, function(err, posts){
      if(err)
      {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {title : user.name, posts : posts})
    });
  })
});



router.post('/post', checkLogin);
router.post('/post', function(req, res){
  var currentUser = req.session.user;

  var post = new Post(currentUser.name, req.body.post);

  post.save(function(err){
    if(err)
    {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '发表成功');
    console.log(currentUser);
    res.redirect('/u/' + currentUser.name);
  });

});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
  res.render('reg', {title:"用户注册"});
});

router.post('/reg', checkNotLogin);

router.post('/reg', function(req, res) {
  console.log(req.body);
  if(req.body['password-repeat'] != req.body['password'])
  {
    req.flash('error', '两次输入的口令不一致');
    return res.redirect('/reg');
  }
  var md5 = crypto.createHash('md5');

  var password = md5.update(req.body.password).digest('base64');

  var newUser = new User({name : req.body.username, password : password});

  User.get(newUser.name, function(err, user){
    if(user)
    {
      err = '该用户已被大圣注册过了, 请换号注册.';
    }
    if(err)
    {
      req.flash('error', err);
      console.log('err');
      return res.redirect('/reg');
    }

    newUser.save(function(err)
    {
      if(err)
      {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = newUser;
      req.flash('success', '注册成功');
      return res.redirect('/');
    });
  });
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
  res.render('login', {title : '用户登录',posts : []});
});


router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  User.get(req.body.username, function(err, user){
    if(!user)
    {
      req.flash('error', '该用户不存在');
      return res.redirect('/login');
    }
    if(user.password != password)
    {
      req.flash('error', '登录密码错误');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', '登录成功');
    res.redirect('/');
  })
});

router.get('/logout',checkLogin);
router.get('/logout', function(req, res) {
  req.session.user = null;
  req.flash('success', '登出成功');
  res.redirect('/');
});

router.get('/report', checkLogin);
router.get('/report', function(req, res) {
  res.render('report', {title : '活跃度统计'});
});

router.post('/report', function(req, res) {
  var result = {};

  var _share = new Share({});

  _share.getUserPostSum(function(err, data) {
    if (err) {
      res.render('error', { error: err });
    }
    console.log("结果 ： " + data);
    var xArray = [];
    var yArray = [];
    data.forEach(function(sum, index){
      xArray.push(sum._id);
      yArray.push(sum.num);
    });
    var result  = {name : xArray, num : yArray};
    res.json(result);
  });
});

router.get('/share', checkLogin);
router.get('/share', function(req, res) {
  res.render('share', {title : '知识分享'});
});

router.post('/share', checkLogin);
router.post('/share', function(req, res) {
  var share = new Share({
    user : req.session.user.name,
    marker : req.body.marker,
    time : new Date().format("yyyy-MM-dd hh:mm:ss"),
    editor1 : req.body.editor1
  });

  share.save(function(err, result){
    if(err)
    {
      req.flash('error', '分享失败: [' + err + ']');
      return ;
    }
    else
    {
      req.flash('success', '分享成功!!! 谢谢分享.');
      res.redirect('/share');
    }
  });
});

router.post('/search', function(req, res) {
  var share = new Share({});

  var marker = req.body.marker;

  res.render('search',{searchkey : marker, title : '主题搜索'});
});

router.post('/showshare', function(req, res) {

  var _id = req.body._id;

  Share.find({_id : _id}, function(err, item){
    if(err)
    {
      req.flash('error', '未找到明细信息');
      return ;
    }
    else
    {
      res.json(item[0]);
    }
  });
});

router.post('/search_data', function(req, res) {

  var offset = req.body.offset;
  var pagesize = req.body.pagesize;

  var marker = req.body.marker;

  var query = Share.find({marker : new RegExp(marker)});
  query.limit(pagesize);
  query.skip(offset);
  query.exec(function(err, querylist){
    if(err)
    {
      req.flash('error', '符合主题[' + marker + ']的分享有 0 条');
      return ;
    }
    else
    {
      Share.find({marker : new RegExp(marker)}, function(err, totallist){
        var re = {rows : querylist, total : totallist.length};
        res.json(re);
      });
    }
  });
});

router.get('/user/info', function(req, res) {

  User.get(req.session.user.name, function(err, user){

    console.log("user is : " + user);
    console.log("获取到的用户是: " + JSON.stringify(user));
    if(!user)
    {
      console.log("发生了错误....");
      req.flash('error', '该用户不存在');
      return res.render('userinfo', {title : '个人信息'});
    }

    req.session.user = user;

    console.log("照片是：" + user.pic);

    req.flash('user', user);
    return res.render('userinfo', {title : '个人信息'});
  })
});

router.post('/user/update', function(req, res) {

    var user = {name : req.body.user, gender : req.body.gender, borth : req.body.borth};

    User.update(user, function(err)
    {
        if(err)
        {
            req.flash('error', err);

            return res.render('userinfo', {title : '个人信息'});
        }

        req.session.user.gender = user.gender;
        req.session.user.borth = user.borth;

        req.flash('success', '保存成功');
        req.flash('user', req.session.user);

        return res.render('userinfo', {title : '个人信息'});
    });
});

router.post('/user/pic', function(req, res){

  var upfile = req.files.upfile;

  User.get(req.session.user.name, function(err, user){
    if(!user)
    {
      req.flash('error', '未登录');
      return res.redirect('/login');
    }
    var target_path = "../public/upload/images/" + upfile.name;

    var save_path = "/upload/images/" + upfile.name;

    fs.rename(upfile.path, target_path, function(err)
    {
      if(err)
      {
        req.flash('error', err);
        return res.render('userinfo', {title : '个人信息'});
      }
    });

    user.pic = save_path;

    User.update(user, function(err)
    {
      if(err)
      {
        req.flash('error', err);
        return res.render('userinfo', {title : '个人信息'});
      }

      req.session.user = user;
      req.flash('success', '头像修改成功');
      req.flash('user', req.session.user);
      return res.render('userinfo', {title : '个人信息'});
    });
  });
});

router.post('/user/changepwd', function(req, res) {

  var old_pwd = req.body.old_pwd;
  var new_pwd = req.body.new_pwd;
  var new_pwd1 = req.body.new_pwd1;

  if(new_pwd != new_pwd1)
  {
    res.json({success : false, msg : "输入的两次密码不一致"});
  }

  var md5 = crypto.createHash('md5');
  var password = md5.update(old_pwd).digest('base64');
  var md6 = crypto.createHash('md5');
  var new_password = md6.update(new_pwd).digest('base64');

  if(password != req.session.user.password)
  {
    res.json({success : false, msg : "当前密码不正确"});
  }

  User.changepwd({name : req.session.user.name, password : new_password}, function(err)
  {
    if(err)
    {
      res.json({success : false, msg : "密码修改失败"});
    }

    req.session.user.password = new_password;

    res.json({success : true, msg : "密码修改成功!"});
  });

});

function checkLogin(req, res, next)
{
  if(!req.session.user)
  {
    req.flash('error', '未登录');
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next)
{
    if(req.session.user)
    {
      req.flash('error', '已登录');
      return res.redirect('/');
    }
    next();
}

Date.prototype.format = function(fmt)
{ //author: meizz
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
}

module.exports = router;
