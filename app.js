var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multiparty = require('connect-multiparty');

var routes = require('./routes/index');
var users = require('./routes/users');

var settings = require('./settings');

var expsession = require('express-session');
var MongoStore = require('connect-mongo')(expsession);

var flash = require('connect-flash');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(multiparty({uploadDir:'../public/upload/temp', keepExtensions:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expsession({
    resave:false,
    saveUninitialized:true,
    secret:settings.coolieSecret,
    key:settings.db,
    cookie : {maxAge : 1000*60*60*24*30},
    store : new MongoStore({
       url : 'mongodb://' + settings.host + '/' + settings.db
    })
}));

app.use(flash());

app.use(function(req, res, next){
    res.locals.user = req.session.user;
    var err = req.flash('error');
    var success = req.flash('success');

    res.locals.error = err.length ? err : null;
    res.locals.success = success.length ? success : null;

    next();
});


app.use('/', routes);
app.use('/users', users);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;
