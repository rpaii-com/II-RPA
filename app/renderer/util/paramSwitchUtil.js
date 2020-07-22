/**
 *
 */
/**
 *
 */
// const errorStack = require("../important/errorStack");
const moment=require("moment");

var paramSwitchUtil = {
    doParamSwitch: function (data, callback) {
        var args = data.paramName.split(",");
        var functionName = data.functionName;

        switch (functionName) {
            case "strInStr":
                this.strInStr(args, callback);
                break;
            case "getTime":
                this.getTime(callback);
                break;
            case "dateNowStr":
                this.dateNowStr(callback);
                break;
            case "strToTimeStamp":
                this.strToTimeStamp(args, callback);
                break;
            case "getYear":
                this.getYear(args, callback);
                break;
            case "dateAddDays":
                this.dateAddDays(args, callback);
                break;
            case "transPathToWin":
                this.transPathToWin(args, callback);
                break;
            case "strReplace":
                this.strReplace(args, callback);
                break;
            case "getRandom":
                this.getRandom(args, callback);
                break;
            default:
                // callback(errorStack("ElementNotFoundException", "没有此选项！"));
        }
    },
    getRandom: function (args, callback) {
        let min = parseInt(args[0]),
            max = parseInt(args[1]);
        let result = parseInt(Math.random() * Math.abs(max - min) + min);
        // console.log(min,max,result);
        callback(null, result);
    },
    //特殊字符替换
    specialReplace: function (text) {
        text = text.indexOf("\\r") > -1 ? text.replace(/\\r/g, '\r') : text;
        text = text.indexOf("\\n") > -1 ? text.replace(/\\n/g, '\n') : text;
        text = text.indexOf("\\'") > -1 ? text.replace(/\\'/g, '\'') : text;
        text = text.indexOf("\\\"") > -1 ? text.replace(/\\"/g, '\"') : text;
        text = text.indexOf("\\&") > -1 ? text.replace(/\\&/g, '\&') : text;
        text = text.indexOf("\\t") > -1 ? text.replace(/\\t/g, '\t') : text;
        text = text.indexOf("\\b") > -1 ? text.replace(/\\b/g, '\b') : text;
        text = text.indexOf("\\f") > -1 ? text.replace(/\\f/g, '\f') : text;
        return text;
    },
    //字符串替换
    strReplace: function (args, callback) {
        let that = this;
        try {
            var str_object = args[0];
            var substr = args[1];
            var replacement = that.specialReplace(args[2]);
            var is_all = "true";
            if (args.length > 3) {
                is_all = args[3];
            }
            if (is_all == "true") {
                var reg = new RegExp(substr, "g");
                var result = str_object.replace(reg, replacement);
            } else {
                result = str_object.replace(args[1], replacement);
            }
            callback(null, result);
        } catch (e) {
            callback(e);
        }
    },
    transPathToWin: function (args, callback) {
        var path = args[0];
        var new_path = path.replace(/\//g, '\\');

        callback(null, new_path);
    },
    strInStr: function (args, callback) {
        var str_fir = args[0];
        var str_sec = args[1];

        if (str_sec.indexOf(str_fir) != -1) {
            callback(null, "true");
        } else {
            callback(null, "false");
        }
    },
    /*获取当前时间戳*/
    getTime: function (callback) {
        callback(null, new Date().getTime());
    },
    /*返回当前日期字符串*/
    dateNowStr: function (callback) {
        callback(null, new Date().toLocaleDateString().replace(/\//g,'-'));
    },
    /*时间字符串 转 时间*/
    strToDate: function (dateStr, callback) {
        callback(null, new Date(dateStr));
    },
    /*时间字符串转时间戳*/
    strToTimeStamp: function (args, callback) {
        var dateStr = args[0];
        callback(null, Date.parse(dateStr));
    },
    /*返回年份*/
    getYear: function (args, callback) {
        var dateStr = args[0];
        var date = new Date(dateStr);
        callback(null, date.getFullYear());
    },
    /*时间字符串，加减天数，返回时间*/
    dateAddDays: function (args, callback) {
        let dateStr=args[0],
            dayNum=args[1],
            type=args[2];

        let oldDate=moment(dateStr,'"YYYY/MM/DD"');
        let res;
        if(type=='add'){
            res=oldDate.add(dayNum,'days').format('YYYY-MM-DD')
        }else{
            res=oldDate.subtract(dayNum,'days').format('YYYY-MM-DD')
        }
        callback(null,res);
    },
    /**
     * 增加 或 减少 月份
     * @param date 时间
     * @param days 增加或减少的月数 正数/负数
     * @returns {Date} 时间
     */
    dateAddMonths: function (param) {
        let date = param[0];
        let months = param[1];
        date = new Date(date);
        //下标从0开始
        let currentMon = date.getMonth();
        let currentYear = date.getFullYear()
        if (currentMon > -1 && currentMon < 12) {
            let nextMon = (currentMon + months) % 12;
            let count = Math.floor((currentMon + months) / 12);
            date.setMonth(nextMon);
            date.setFullYear(currentYear + count);
        }
        return date
    }
}

// 变量转换 内置方法
let param_fun_array = [
    { name: 'getTime', paramNum: 0, ads_fun: "获取当前时间戳", ads: "无需变量" },
    { name: 'dateNowStr', paramNum: 0, ads_fun: "返回当前日期时间字符串", ads: "无需变量" },
    { name: 'strToTimeStamp', paramNum: 1, ads_fun: "时间字符串转时间戳", ads: "变量1（时间字符串）" },
    { name: 'getYear', paramNum: 1, ads_fun: "返回年份", ads: "变量1（时间字符串）" },
    { name: 'dateAddDays', paramNum: 2, ads_fun: "加减天数", ads: "变量1（时间字符串）,变量2（天数）,变量3(add或者sub)" },
    { name: 'strInStr', paramNum: 2, ads_fun: "判断字符串是否包含另一字符串", ads: "变量1（被包含字符串）,变量2（长字符串）" },
    { name: 'transPathToWin', paramNum: 1, ads_fun: "将js文件路径改为win文件路径", ads: "变量1（待处理路径）" },
    { name: 'strReplace', paramNum: 4, ads_fun: "字符串替换", ads: "待处理字符串，待替换字符串,替换的字符串,变量4（false，只替换第一个，true，替换全部）" },
    { name: 'getRandom', paramNum: 2, ads_fun: "随机整数", ads: "范围最小值，范围最大值" }
];


//扩展 format 方法
Date.prototype.format = function (format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}
module.exports = paramSwitchUtil