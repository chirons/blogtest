var log4js = require('log4js');

log4js.configure({
    appenders : [
        {
            type : "console"
        },{
            type : "dateFile",
            filename : "./logs/error",
            pattern : "_yyyyMMdd.log",
            alwaysIncludePattern : true,
            absolute : false,
            category : "dateFile"
        }],
    replaceConsole : true,
    levels : {
        dateFileLog : "INFO"
    }
})

var dateFileLog = log4js.getLogger('dateFileLog');

exports.logger = dateFileLog;

exports.use = function(app){
    app.use(log4js.connectLogger(dateFileLog, {level:'auto', format:':method :url'}));
}