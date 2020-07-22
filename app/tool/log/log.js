const log4js = require('log4js');

const log_config = require('./config');
// const log4js_extend = require("log4js-extend");
// log4js_extend(log4js, {
//     path: __dirname,
//     format: "at @name (@file:@line:@column)"
// });
//console.log(log4js.getLogger('default').constructor.prototype["info"])
//加载配置文件
log4js.configure(log_config);
var log = {};

var consoleLogger = log4js.getLogger('default');
//console.log(consoleLogger.info)
// consoleLogger.info("test")
// console.log = consoleLogger.info.bind(consoleLogger)
// console.error = consoleLogger.error.bind(consoleLogger)

log.warn = function (msg) {
    var logText = new String();
    logText += msg;
    consoleLogger.warn(logText);
}

log.info = function (msg) {
    var logText = new String();
    logText += msg;
    consoleLogger.info(logText);
}

log.error = function (error) {
    var logText = new String();
    logText += error;
    consoleLogger.error(logText);
}
module.exports = log;