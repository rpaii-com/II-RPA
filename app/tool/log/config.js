'use strict';
var path = require('path');

//日志根目录
var baseLogPath = path.resolve(__dirname, './logs')

//错误日志目录
var errorPath = "/error";
//错误日志文件名
var errorFileName = "error";

//错误日志输出完整路径
var errorLogPath = baseLogPath + errorPath + "/" + errorFileName;

//完整日志目录
var infoPath = "/info";
//完整日志文件名
var infoFileName = "loginfo";
//日志输出完整路径
var infoLogPath = baseLogPath + infoPath + "/" + infoFileName;


// v2 配置。
var log_config = {
    appenders:
    {
        //错误日志
        errorLogger: {
            type: "dateFile",                   //日志类型
            filename: errorLogPath,             //日志输出位置
            alwaysIncludePattern: true,         //是否总是有后缀名
            pattern: "-yyyy-MM-dd.log",         //后缀，每天创建一个新的日志文件
            daysToKeep: 7,                       //日志保留天数，暂无(自定义属性)
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] - %m',
            },
        },
        //控制台输出
        consoleLogger: {
            type: "console",
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] - %m',
            },
        },
        infoLogger: {
            type: "dateFile",                   //日志类型
            filename: infoLogPath,              //日志输出位置
            alwaysIncludePattern: true,         //是否总是有后缀名
            pattern: "-yyyy-MM-dd.log",         //后缀，每天创建一个新的日志文件
            daysToKeep: 7,                       //日志保留天数，暂无(自定义属性)
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] - %m',
            },
        },
        erorr: {
            type: 'logLevelFilter',
            appender: 'errorLogger',
            level: "error"
        },
        debug: {
            type: 'logLevelFilter',
            appender: 'consoleLogger',
            level: "debug"
        },
        info: {
            type: 'logLevelFilter',
            appender: 'infoLogger',
            level: "info"
        }
    },

    categories:                                   //设置logger名称对应的的日志等级
    {
        default: {
            appenders: ['info', "erorr"],
            level: "info",
        },
    }

}

module.exports = log_config;